import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from config import settings
from database import get_db
import models
from schemas import LostItemCreate, LostItemOut, FoundItemOut
from dependencies import get_current_user
from routers.matching import run_matching, run_reverse_matching

router = APIRouter(tags=["Items"])


def generate_presigned_url(s3_key: Optional[str], expiration: int = 3600) -> Optional[str]:
    """
    Generate a presigned GET URL for an S3 object.
    In local dev mode with 'local/' key, return the local server /uploads URL.
    """
    if not s3_key:
        return None

    if s3_key.startswith("local/"):
        filename = s3_key.replace("local/", "")
        return f"/uploads/{filename}"

    if settings.LOCAL_DEV or settings.S3_BUCKET == "local-bucket":
        return None

    try:
        import boto3
        s3_client = boto3.client("s3", region_name=settings.REGION_NAME)
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET, "Key": s3_key},
            ExpiresIn=expiration,
        )
        return url
    except Exception as e:
        print(f"Error generating presigned URL for {s3_key}: {e}")
        return None


def upload_to_s3(file: UploadFile) -> str:
    """
    Upload file to S3 with key 'found/{uuid4}_{filename}'.
    If LOCAL_DEV is true or S3_BUCKET is 'local-bucket', save file locally into uploads/.
    """
    filename = file.filename or "upload.jpg"
    unique_id = str(uuid.uuid4())
    stored_name = f"{unique_id}_{filename}"

    if settings.LOCAL_DEV or settings.S3_BUCKET == "local-bucket":
        import os
        import shutil
        os.makedirs("uploads", exist_ok=True)
        local_path = os.path.join("uploads", stored_name)
        with open(local_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # Reset file pointer in case caller needs it
        file.file.seek(0)
        return f"local/{stored_name}"

    s3_key = f"found/{unique_id}_{filename}"
    import boto3
    s3_client = boto3.client("s3", region_name=settings.REGION_NAME)
    s3_client.upload_fileobj(
        file.file,
        settings.S3_BUCKET,
        s3_key,
        ExtraArgs={"ContentType": file.content_type or "application/octet-stream"},
    )
    return s3_key



# ----------------- Lost Items Endpoints -----------------

@router.post("/lost", response_model=LostItemOut, status_code=status.HTTP_201_CREATED)
def create_lost_item(
    item_in: LostItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Report a lost item. Authenticated (any user role).
    """
    lost_item = models.LostItem(
        user_id=current_user.id,
        title=item_in.title,
        description=item_in.description,
        date_lost=item_in.date_lost,
        location_lost=item_in.location_lost,
        category=item_in.category,
        status="open",
    )
    db.add(lost_item)
    db.commit()
    db.refresh(lost_item)
    run_reverse_matching(lost_item.id, db)
    return lost_item


@router.get("/lost", response_model=List[LostItemOut])
def get_lost_items(db: Session = Depends(get_db)):
    """
    Get all lost items, newest first. Public endpoint.
    """
    items = db.query(models.LostItem).order_by(models.LostItem.created_at.desc()).all()
    return items


@router.get("/lost/{item_id}", response_model=LostItemOut)
def get_lost_item_by_id(item_id: int, db: Session = Depends(get_db)):
    """
    Get a single lost item by ID. Public endpoint.
    """
    item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lost item with id {item_id} not found.",
        )
    return item


# ----------------- Found Items Endpoints -----------------

@router.post("/found", response_model=FoundItemOut, status_code=status.HTTP_201_CREATED)
def create_found_item(
    title: str = Form(...),
    category: str = Form(...),
    location_found: str = Form(...),
    date_found: datetime = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Report a found item with multipart/form-data. Authenticated (any user role).
    Uploads image to S3 if provided.
    """
    image_key: Optional[str] = None
    if image is not None and image.filename:
        image_key = upload_to_s3(image)

    found_item = models.FoundItem(
        user_id=current_user.id,
        title=title,
        category=category,
        description=description,
        location_found=location_found,
        date_found=date_found,
        storage_key=image_key,
        status="reported",
    )
    db.add(found_item)
    db.commit()
    db.refresh(found_item)
    run_matching(found_item.id, db)

    presigned_url = generate_presigned_url(found_item.storage_key)

    return FoundItemOut(
        id=found_item.id,
        user_id=found_item.user_id,
        title=found_item.title,
        description=found_item.description,
        date_found=found_item.date_found,
        location_found=found_item.location_found,
        category=found_item.category,
        image_s3_key=found_item.storage_key,
        presigned_url=presigned_url,
        status=found_item.status,
        created_at=found_item.created_at,
    )


@router.get("/found", response_model=List[FoundItemOut])
def get_found_items(db: Session = Depends(get_db)):
    """
    Get all found items, newest first. Public endpoint.
    Includes fresh presigned URLs for items with images.
    """
    items = db.query(models.FoundItem).order_by(models.FoundItem.created_at.desc()).all()
    results = []
    for item in items:
        results.append(
            FoundItemOut(
                id=item.id,
                user_id=item.user_id,
                title=item.title,
                description=item.description,
                date_found=item.date_found,
                location_found=item.location_found,
                category=item.category,
                image_s3_key=item.storage_key,
                presigned_url=generate_presigned_url(item.storage_key),
                status=item.status,
                created_at=item.created_at,
            )
        )
    return results


@router.get("/found/{item_id}", response_model=FoundItemOut)
def get_found_item_by_id(item_id: int, db: Session = Depends(get_db)):
    """
    Get a single found item by ID. Public endpoint.
    Includes fresh presigned URL for image if present.
    """
    item = db.query(models.FoundItem).filter(models.FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Found item with id {item_id} not found.",
        )
    return FoundItemOut(
        id=item.id,
        user_id=item.user_id,
        title=item.title,
        description=item.description,
        date_found=item.date_found,
        location_found=item.location_found,
        category=item.category,
        image_s3_key=item.storage_key,
        presigned_url=generate_presigned_url(item.storage_key),
        status=item.status,
        created_at=item.created_at,
    )


# ----------------- Claims Endpoints (Phase 13) -----------------
from schemas import ClaimCreate, ClaimOut

@router.post("/claims", response_model=ClaimOut, status_code=status.HTTP_201_CREATED)
def submit_claim(
    claim_in: ClaimCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit an ownership claim on a found item. Any authenticated student or staff.
    """
    found_item = db.query(models.FoundItem).filter(models.FoundItem.id == claim_in.found_item_id).first()
    if not found_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Found item #{claim_in.found_item_id} not found.",
        )

    # Check if this user already claimed this item
    existing = db.query(models.Claim).filter(
        models.Claim.found_item_id == claim_in.found_item_id,
        models.Claim.user_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a claim for this item.",
        )

    new_claim = models.Claim(
        found_item_id=claim_in.found_item_id,
        user_id=current_user.id,
        proof_description=claim_in.proof_description,
        status="pending",
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    return ClaimOut(
        id=new_claim.id,
        found_item_id=new_claim.found_item_id,
        user_id=new_claim.user_id,
        proof_description=new_claim.proof_description,
        status=new_claim.status,
        reviewed_by=new_claim.reviewed_by,
        created_at=new_claim.created_at,
        claimant_name=current_user.name,
        claimant_email=current_user.email,
        found_item_title=found_item.title,
    )


@router.get("/claims", response_model=List[ClaimOut])
def get_all_claims(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get claims. Security/Admin view all claims; regular users view their own claims.
    """
    if current_user.role in ["security", "admin"]:
        claims = db.query(models.Claim).order_by(models.Claim.created_at.desc()).all()
    else:
        claims = db.query(models.Claim).filter(models.Claim.user_id == current_user.id).order_by(models.Claim.created_at.desc()).all()

    results = []
    for c in claims:
        item = db.query(models.FoundItem).filter(models.FoundItem.id == c.found_item_id).first()
        claimant = db.query(models.User).filter(models.User.id == c.user_id).first()
        results.append(
            ClaimOut(
                id=c.id,
                found_item_id=c.found_item_id,
                user_id=c.user_id,
                proof_description=c.proof_description,
                status=c.status,
                reviewed_by=c.reviewed_by,
                created_at=c.created_at,
                claimant_name=claimant.name if claimant else "Student",
                claimant_email=claimant.email if claimant else "unknown",
                found_item_title=item.title if item else f"Item #{c.found_item_id}",
            )
        )
    return results


@router.put("/claims/{claim_id}/resolve", response_model=ClaimOut)
def resolve_claim(
    claim_id: int,
    action: str,  # "approve" or "reject"
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Security officer reviews and approves or rejects a claim.
    """
    if current_user.role not in ["security", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only security officers or admins can review and resolve claims.",
        )

    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Claim #{claim_id} not found.",
        )

    if action not in ["approve", "reject"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action must be 'approve' or 'reject'.",
        )

    claim.status = "approved" if action == "approve" else "rejected"
    claim.reviewed_by = current_user.id

    # If approved, mark the found item as claimed / handed over
    found_item = db.query(models.FoundItem).filter(models.FoundItem.id == claim.found_item_id).first()
    if found_item and action == "approve":
        found_item.status = "claimed"

    db.commit()
    db.refresh(claim)

    claimant = db.query(models.User).filter(models.User.id == claim.user_id).first()
    return ClaimOut(
        id=claim.id,
        found_item_id=claim.found_item_id,
        user_id=claim.user_id,
        proof_description=claim.proof_description,
        status=claim.status,
        reviewed_by=claim.reviewed_by,
        created_at=claim.created_at,
        claimant_name=claimant.name if claimant else "Student",
        claimant_email=claimant.email if claimant else "unknown",
        found_item_title=found_item.title if found_item else f"Item #{claim.found_item_id}",
    )


import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas import MatchOut
from config import settings
from routers.notifications import notify_match

router = APIRouter(tags=["Matching"])


def extract_keywords(text: str) -> set:
    """Extract lowercased words longer than 3 characters, splitting on non-alphanumeric chars."""
    if not text:
        return set()
    words = re.findall(r"[a-zA-Z0-9]+", text.lower())
    return {w for w in words if len(w) > 3}


def run_matching(found_item_id: int, db: Session) -> List[models.Match]:
    """
    Match engine:
    1. Extract Rekognition labels for the found item (skips in LOCAL_DEV or local keys).
    2. Compares against all open LostItems.
    3. Calculates confidence score (0-100) based on category, Rekognition labels, and description keywords.
    4. Upserts Match records if score >= 40.
    """
    found_item = db.query(models.FoundItem).filter(models.FoundItem.id == found_item_id).first()
    if not found_item:
        return []

    labels_list: List[str] = []

    # Handle Rekognition
    s3_key = found_item.storage_key
    if s3_key and not settings.LOCAL_DEV and settings.S3_BUCKET != "local-bucket" and not s3_key.startswith("local/"):
        try:
            import boto3
            rekognition = boto3.client("rekognition", region_name=settings.REGION_NAME)
            response = rekognition.detect_labels(
                Image={"S3Object": {"Bucket": settings.S3_BUCKET, "Name": s3_key}},
                MaxLabels=10,
                MinConfidence=70.0,
            )
            for lbl in response.get("Labels", []):
                name = lbl.get("Name", "").lower()
                conf = float(lbl.get("Confidence", 0.0))
                if name:
                    labels_list.append(name)
                    # Check if already stored to avoid duplicate labels
                    existing_label = db.query(models.ItemLabel).filter(
                        models.ItemLabel.found_item_id == found_item.id,
                        models.ItemLabel.label_name == name,
                    ).first()
                    if not existing_label:
                        item_label = models.ItemLabel(
                            found_item_id=found_item.id,
                            label_name=name,
                            confidence=conf,
                        )
                        db.add(item_label)
            db.commit()
        except Exception as e:
            print(f"Error executing Rekognition detect_labels: {e}")
            db.rollback()

    # Load all open lost items
    open_lost_items = db.query(models.LostItem).filter(models.LostItem.status == "open").all()
    created_or_updated_matches: List[models.Match] = []
    newly_created_matches: List[models.Match] = []

    found_desc_words = extract_keywords(found_item.description or "")
    found_title_words = extract_keywords(found_item.title or "")

    for lost_item in open_lost_items:
        score = 0.0

        # 1. Category match (+35)
        if (found_item.category or "").strip().lower() == (lost_item.category or "").strip().lower():
            score += 35.0

        # 2. Rekognition visual AI labels (+30 max)
        lost_title_lower = (lost_item.title or "").lower()
        lost_desc_lower = (lost_item.description or "").lower()
        matched_labels = [lbl for lbl in labels_list if lbl in lost_title_lower or lbl in lost_desc_lower]
        if matched_labels:
            # Base 25 for first label, up to 30 for multiple visual detections
            score += min(30.0, 25.0 + (len(matched_labels) - 1) * 2.5)

        # 3. Title keyword similarity (+20 max)
        lost_title_words = extract_keywords(lost_item.title or "")
        common_title_words = found_title_words.intersection(lost_title_words)
        if common_title_words:
            score += min(20.0, float(len(common_title_words) * 10))

        # 4. Description keyword overlap (+15 max)
        lost_desc_words = extract_keywords(lost_item.description or "")
        common_words = found_desc_words.intersection(lost_desc_words)
        score += min(15.0, float(len(common_words) * 5))

        # 5. Location flexibility / campus ambiguity handling
        # If student indicated unknown/anywhere on campus, do not penalize; grant a neutral flexibility boost (+10)
        # If exact room/floor match, grant (+15)
        lost_loc = (lost_item.location_lost or "").strip().lower()
        found_loc = (found_item.location_found or "").strip().lower()

        unknown_indicators = ["not sure", "unknown", "anywhere", "somewhere", "campus", "unspecified"]
        if any(ind in lost_loc for ind in unknown_indicators):
            score += 10.0
        elif lost_loc and found_loc and (lost_loc in found_loc or found_loc in lost_loc):
            score += 15.0

        # Cap maximum confidence score at 98.0%
        score = min(98.0, round(score, 1))

        if score >= 40.0:
            # Check if match already exists
            existing_match = db.query(models.Match).filter(
                models.Match.found_item_id == found_item.id,
                models.Match.lost_item_id == lost_item.id,
            ).first()

            if existing_match:
                existing_match.confidence_score = score
                match_record = existing_match
            else:
                match_record = models.Match(
                    found_item_id=found_item.id,
                    lost_item_id=lost_item.id,
                    confidence_score=score,
                    status="pending",
                )
                db.add(match_record)
                newly_created_matches.append(match_record)

            created_or_updated_matches.append(match_record)

    db.commit()
    for m in created_or_updated_matches:
        db.refresh(m)

    # Trigger notifications only on new matches
    for new_m in newly_created_matches:
        notify_match(new_m, db)

    return created_or_updated_matches


def run_reverse_matching(lost_item_id: int, db: Session) -> List[models.Match]:
    """
    Trigger matching against all reported found items when a new lost item is created.
    """
    lost_item = db.query(models.LostItem).filter(models.LostItem.id == lost_item_id).first()
    if not lost_item or lost_item.status != "open":
        return []

    found_items = db.query(models.FoundItem).filter(models.FoundItem.status == "reported").all()
    all_matches = []
    for found in found_items:
        matches = run_matching(found.id, db)
        for m in matches:
            if m.lost_item_id == lost_item_id:
                all_matches.append(m)
    return all_matches


# ----------------- Matches Endpoints -----------------

@router.get("/lost/{lost_item_id}", response_model=List[MatchOut])
def get_matches_for_lost_item(lost_item_id: int, db: Session = Depends(get_db)):
    """
    Public endpoint: Get all matches for a lost item with score >= 40, sorted by score descending.
    """
    # Verify lost item exists
    lost_item = db.query(models.LostItem).filter(models.LostItem.id == lost_item_id).first()
    if not lost_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lost item with id {lost_item_id} not found.",
        )

    matches = (
        db.query(models.Match)
        .filter(
            models.Match.lost_item_id == lost_item_id,
            models.Match.confidence_score >= 40.0,
        )
        .order_by(models.Match.confidence_score.desc())
        .all()
    )
    return matches


@router.get("/found/{found_item_id}", response_model=List[MatchOut])
def get_matches_for_found_item(found_item_id: int, db: Session = Depends(get_db)):
    """
    Public endpoint: Get all matches for a found item with score >= 40, sorted by score descending.
    """
    # Verify found item exists
    found_item = db.query(models.FoundItem).filter(models.FoundItem.id == found_item_id).first()
    if not found_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Found item with id {found_item_id} not found.",
        )

    matches = (
        db.query(models.Match)
        .filter(
            models.Match.found_item_id == found_item_id,
            models.Match.confidence_score >= 40.0,
        )
        .order_by(models.Match.confidence_score.desc())
        .all()
    )
    return matches

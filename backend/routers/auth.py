from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas import UserRegister, UserLogin, Token, UserOut
from security import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from dependencies import get_current_user

router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user. Role is strictly assigned to 'student'.
    Rejects duplicate email addresses with 400 Bad Request.
    """
    # Check if email is already registered
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered.",
        )

    # Hash password and create student user
    hashed_pwd = hash_password(user_in.password)
    new_user = models.User(
        email=user_in.email,
        full_name=user_in.name,
        hashed_password=hashed_pwd,
        phone=user_in.phone,
        role="student",  # Registration is always student
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserOut(
        id=new_user.id,
        email=new_user.email,
        name=new_user.full_name,
        phone=new_user.phone,
        role=new_user.role,
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user with email and password, returning a signed JWT Bearer token.
    """
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": user.email,
        "role": user.role,
        "name": user.full_name,
    }
    access_token = create_access_token(data=token_payload, expires_delta=access_token_expires)

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    """
    Return currently authenticated user profile from valid JWT.
    """
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
    )

from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models
from security import decode_access_token

# OAuth2 scheme extracting Bearer token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """Validate JWT token and return active user model from database."""
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_role(required_role: str) -> Callable:
    """Dependency factory enforcing specific user role or raising 403 Forbidden."""
    def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires '{required_role}' role privileges.",
            )
        return current_user
    return role_checker

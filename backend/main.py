from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from config import settings
from database import get_db, engine, Base
import models  # Ensures models are imported for metadata creation
from routers import auth, items, matching
from dependencies import require_role


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they do not exist
    try:
        Base.metadata.create_all(bind=engine)
        # Ensure default security officer and student accounts exist and have expected test passwords
        from database import SessionLocal
        from security import hash_password
        db = SessionLocal()
        officer = db.query(models.User).filter(models.User.email == "officer@college.edu").first()
        if not officer:
            new_officer = models.User(
                email="officer@college.edu",
                full_name="Campus Security Officer",
                hashed_password=hash_password("AdminPass123!"),
                role="security",
            )
            db.add(new_officer)
            db.commit()
            print("Seeded default security officer: officer@college.edu / AdminPass123!")
        else:
            officer.hashed_password = hash_password("AdminPass123!")
            officer.role = "security"
            db.commit()

        student = db.query(models.User).filter(models.User.email == "student@college.edu").first()
        if student:
            student.hashed_password = hash_password("StudentPass123!")
            db.commit()
        db.close()
    except Exception as e:
        print(f"Warning: Database initialization delayed or failed: {e}")
    yield



app = FastAPI(
    title="Campus Lost & Found API",
    description="Backend API for Campus Lost & Found with AI-Assisted Item Matching",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory if in local development
import os
from fastapi.staticfiles import StaticFiles

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register routers
app.include_router(auth.router, prefix="/auth")
app.include_router(items.router, prefix="/items")
app.include_router(matching.router, prefix="/matches")



@app.get("/")
def read_root():
    return {
        "service": "Campus Lost & Found API",
        "status": "online",
        "local_dev": settings.LOCAL_DEV,
    }


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check(db: Session = Depends(get_db)):
    """
    Checks the connectivity to the database and general backend health.
    """
    try:
        # Execute lightweight ping query to verify DB connection
        db.execute(text("SELECT 1"))
        return {
            "status": "OK",
            "database": "connected",
            "mode": "local_dev" if settings.LOCAL_DEV else "cloud",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "DEGRADED",
                "database": "disconnected",
                "error": str(e),
            },
        )


@app.get("/test-security-only", tags=["Testing"])
def test_security_only(user: models.User = Depends(require_role("security"))):
    """
    Test endpoint protected by require_role('security') for 403 test verification.
    """
    return {"message": f"Welcome, security officer {user.full_name}!", "role": user.role}

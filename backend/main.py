from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from config import settings
from database import get_db, engine, Base
import models  # Ensures models are imported for metadata creation
from routers import auth, items
from dependencies import require_role


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they do not exist (especially useful in local development)
    try:
        Base.metadata.create_all(bind=engine)
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

# Register routers
app.include_router(auth.router, prefix="/auth")
app.include_router(items.router, prefix="/items")


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

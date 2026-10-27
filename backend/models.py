from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Enum,
    ForeignKey,
    Float
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum("student", "security", name="user_roles"), default="student", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    lost_items = relationship("LostItem", back_populates="user", cascade="all, delete-orphan")
    found_items = relationship("FoundItem", back_populates="user", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="user", cascade="all, delete-orphan", foreign_keys="Claim.user_id")


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    location_lost = Column(String(150), nullable=False)
    date_lost = Column(DateTime, nullable=False)
    status = Column(Enum("open", "matched", "resolved", name="lost_item_status"), default="open", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="lost_items")
    matches = relationship("Match", back_populates="lost_item", cascade="all, delete-orphan")


class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    location_found = Column(String(150), nullable=False)
    date_found = Column(DateTime, nullable=False)
    image_url = Column(String(500), nullable=True)
    storage_key = Column(String(255), nullable=True)  # S3 object key
    status = Column(Enum("reported", "claimed", "returned", name="found_item_status"), default="reported", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="found_items")
    labels = relationship("ItemLabel", back_populates="found_item", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="found_item", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="found_item", cascade="all, delete-orphan")


class ItemLabel(Base):
    """
    Labels and attributes extracted automatically by Amazon Rekognition DetectLabels.
    """
    __tablename__ = "item_labels"

    id = Column(Integer, primary_key=True, index=True)
    found_item_id = Column(Integer, ForeignKey("found_items.id"), nullable=False)
    label_name = Column(String(100), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    found_item = relationship("FoundItem", back_populates="labels")


class Match(Base):
    """
    Calculated similarity matches between reported lost items and found items.
    """
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"), nullable=False)
    found_item_id = Column(Integer, ForeignKey("found_items.id"), nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0 to 100.0
    status = Column(Enum("pending", "notified", "confirmed", "rejected", name="match_status"), default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    lost_item = relationship("LostItem", back_populates="matches")
    found_item = relationship("FoundItem", back_populates="matches")


class Claim(Base):
    """
    Student verification claims to retrieve a found item.
    """
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    found_item_id = Column(Integer, ForeignKey("found_items.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    proof_description = Column(Text, nullable=False)
    status = Column(Enum("pending", "approved", "rejected", name="claim_status"), default="pending", nullable=False)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    found_item = relationship("FoundItem", back_populates="claims")
    user = relationship("User", back_populates="claims", foreign_keys=[user_id])

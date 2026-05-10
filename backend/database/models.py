from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum, Float, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    USER = "user"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"

class AlbumStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ImageStatus(enum.Enum):
    PENDING_ANALYSIS = "pending_analysis"
    CLEAN = "clean"
    QUARANTINED = "quarantined"
    APPROVED = "approved"
    REJECTED = "rejected"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(32), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    last_login_attempt = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    albums = relationship("Album", foreign_keys="Album.owner_id", back_populates="owner")
    login_attempts = relationship("LoginAttempt", back_populates="user")

class Album(Base):
    __tablename__ = "albums"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(AlbumStatus), default=AlbumStatus.PENDING, nullable=False)
    is_public = Column(Boolean, default=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", foreign_keys=[owner_id], back_populates="albums")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    images = relationship("Image", back_populates="album")

class Image(Base):
    __tablename__ = "images"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_hash = Column(String(64), nullable=False)  # SHA-256
    status = Column(Enum(ImageStatus), default=ImageStatus.PENDING_ANALYSIS, nullable=False)
    quarantine_reason = Column(Text, nullable=True)
    steganography_score = Column(Float, nullable=True)
    analysis_details = Column(Text, nullable=True)  # JSON string with analysis results
    album_id = Column(Integer, ForeignKey("albums.id"), nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    album = relationship("Album", back_populates="images")
    uploader = relationship("User", foreign_keys=[uploader_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    metadata_records = relationship("ImageMetadata", back_populates="image")

class ImageMetadata(Base):
    __tablename__ = "image_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)
    exif_data = Column(Text, nullable=True)  # JSON string
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    color_channels = Column(Integer, nullable=True)
    has_transparency = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    image = relationship("Image", back_populates="metadata_records")

class LoginAttempt(Base):
    __tablename__ = "login_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username_attempted = Column(String(50), nullable=True)
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(Text, nullable=True)
    success = Column(Boolean, nullable=False)
    attempted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="login_attempts")

class SecurityLog(Base):
    __tablename__ = "security_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(Text, nullable=True)
    severity = Column(String(20), default="INFO", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", foreign_keys=[user_id])

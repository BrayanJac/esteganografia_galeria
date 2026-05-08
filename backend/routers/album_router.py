from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User
from security.auth import get_current_user, require_supervisor_or_admin
from services.album_service import create_album, get_user_albums, get_accessible_albums, get_album_for_user, get_pending_albums, approve_album
from schemas.album_schemas import CreateAlbumRequest, ApproveAlbumRequest

router = APIRouter()

@router.post("/")
async def create_album_endpoint(
    data: CreateAlbumRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await create_album(data.title, data.description, data.is_public, current_user.id, db)

@router.get("/")
async def get_user_albums_endpoint(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return await get_user_albums(current_user.id, db)

@router.get("/library")
async def get_accessible_albums_endpoint(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return await get_accessible_albums(current_user.id, db)

@router.get("/pending")
async def get_pending_albums_endpoint(current_user: User = Depends(require_supervisor_or_admin), db: Session = Depends(get_db)):
    return await get_pending_albums(db)

@router.get("/{album_id}")
async def get_album_endpoint(album_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return await get_album_for_user(album_id, current_user.id, db)

@router.post("/{album_id}/approve")
async def approve_album_endpoint(
    album_id: int,
    data: ApproveAlbumRequest,
    current_user: User = Depends(require_supervisor_or_admin),
    db: Session = Depends(get_db)
):
    return await approve_album(album_id, data.approved, data.comment, current_user.id, db)

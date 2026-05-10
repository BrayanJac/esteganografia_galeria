from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User
from security.auth import get_current_user, require_supervisor_or_admin, require_exact_role
from database.models import UserRole
from services.album_service import create_album, get_user_albums, get_accessible_albums, get_album_for_user, get_pending_albums, get_admin_albums, get_reviewed_albums, approve_album, delete_album, update_album, update_album_review
from schemas.album_schemas import CreateAlbumRequest, ApproveAlbumRequest, UpdateAlbumRequest, UpdateAlbumReviewRequest

router = APIRouter()


@router.post("/")
async def create_album_endpoint(
    data: CreateAlbumRequest,
    current_user: Annotated[User, Depends(require_exact_role(UserRole.USER))],
    db: Annotated[Session, Depends(get_db)]
):
    return create_album(data.title, data.description, data.is_public, current_user.id, db)


@router.get("/")
async def get_user_albums_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    return get_user_albums(current_user.id, db)


@router.get("/library")
async def get_accessible_albums_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    return get_accessible_albums(current_user.id, db)


@router.get("/pending")
async def get_pending_albums_endpoint(
    current_user: Annotated[User, Depends(require_supervisor_or_admin)],
    db: Annotated[Session, Depends(get_db)]
):
    return get_pending_albums(db)


@router.get("/admin")
async def get_admin_albums_endpoint(
    current_user: Annotated[User, Depends(require_exact_role(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)]
):
    return get_admin_albums(db)


@router.get("/reviewed")
async def get_reviewed_albums_endpoint(
    current_user: Annotated[User, Depends(require_supervisor_or_admin)],
    db: Annotated[Session, Depends(get_db)]
):
    return get_reviewed_albums(db)


@router.get("/{album_id}")
async def get_album_endpoint(
    album_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    return get_album_for_user(album_id, current_user.id, db)


@router.post("/{album_id}/approve")
async def approve_album_endpoint(
    album_id: int,
    data: ApproveAlbumRequest,
    current_user: Annotated[User, Depends(require_supervisor_or_admin)],
    db: Annotated[Session, Depends(get_db)]
):
    return approve_album(album_id, data.approved, data.comment, current_user.id, current_user.username, db)


@router.put("/{album_id}")
async def update_album_endpoint(
    album_id: int,
    data: UpdateAlbumRequest,
    current_user: Annotated[User, Depends(require_exact_role(UserRole.USER))],
    db: Annotated[Session, Depends(get_db)]
):
    return update_album(album_id, current_user.id, data.title, data.description, db)


@router.put("/{album_id}/review")
async def update_album_review_endpoint(
    album_id: int,
    data: UpdateAlbumReviewRequest,
    current_user: Annotated[User, Depends(require_supervisor_or_admin)],
    db: Annotated[Session, Depends(get_db)]
):
    return update_album_review(album_id, current_user.id, current_user.username, data.approved, data.review_comment, db)


@router.delete("/{album_id}")
async def delete_album_endpoint(
    album_id: int,
    current_user: Annotated[User, Depends(require_exact_role(UserRole.ADMIN))],
    db: Annotated[Session, Depends(get_db)]
):
    return delete_album(album_id, db)

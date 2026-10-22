from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User
from security.auth import get_optional_user
from services.gallery_service import get_public_gallery, get_album_images, serve_image

router = APIRouter()


@router.get("/gallery")
async def get_public_gallery_endpoint(db: Annotated[Session, Depends(get_db)]):
    return get_public_gallery(db)


@router.get("/gallery/{album_id}")
async def get_album_images_endpoint(album_id: int, db: Annotated[Session, Depends(get_db)]):
    return get_album_images(album_id, db)


@router.get("/uploads/{filename}")
async def get_image_endpoint(
    filename: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_user)]
):
    return serve_image(filename, db, current_user)

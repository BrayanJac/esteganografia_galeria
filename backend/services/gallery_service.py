from fastapi import HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.models import Album, Image, AlbumStatus, ImageStatus
from config.config import *
import os

async def get_public_gallery(db: Session):
    albums = db.query(Album).filter(
        Album.status == AlbumStatus.APPROVED,
        Album.is_public == True
    ).all()
    return [
        {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "owner": album.owner.username,
            "image_count": len(album.images),
            "created_at": album.created_at
        }
        for album in albums
    ]

async def get_album_images(album_id: int, db: Session):
    album = db.query(Album).filter(
        Album.id == album_id,
        Album.status == AlbumStatus.APPROVED,
        Album.is_public == True
    ).first()
    
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Álbum no encontrado"
        )
    
    images = db.query(Image).filter(
        Image.album_id == album_id,
        Image.status == ImageStatus.APPROVED
    ).all()
    
    return {
        "album": {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "owner": album.owner.username
        },
        "images": [
            {
                "id": image.id,
                "filename": image.filename,
                "original_filename": image.original_filename
                ,"status": image.status.value,
                "steganography_detected": image.status == ImageStatus.QUARANTINED
            }
            for image in images
        ]
    }

async def serve_image(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagen no encontrada"
        )
    
    return FileResponse(
        file_path,
        media_type="image/jpeg",
        headers={
            "Cache-Control": "public, max-age=31536000",
            "X-Content-Type-Options": "nosniff"
        }
    )

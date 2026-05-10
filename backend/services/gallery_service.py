from fastapi import HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.models import Album, Image, AlbumStatus, ImageStatus
from config.config import UPLOAD_DIR
import os


def get_public_gallery(db: Session):
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
            "status": album.status.value,
            "image_count": len([
                image for image in album.images
                if image.status in (ImageStatus.CLEAN, ImageStatus.APPROVED)
            ]),
            "cover_image_filename": next(
                (
                    image.filename
                    for image in sorted(album.images, key=lambda image: (image.created_at or image.id, image.id))
                    if image.status in (ImageStatus.CLEAN, ImageStatus.APPROVED)
                ),
                None,
            ),
            "created_at": album.created_at
        }
        for album in albums
    ]


def get_album_images(album_id: int, db: Session):
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
        Image.status.in_([ImageStatus.APPROVED, ImageStatus.CLEAN])
    ).order_by(Image.created_at.asc().nullslast(), Image.id.asc()).all()

    return {
        "album": {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "owner": album.owner.username,
            "status": album.status.value,
            "is_public": album.is_public
        },
        "images": [
            {
                "id": image.id,
                "filename": image.filename,
                "original_filename": image.original_filename,
                "status": image.status.value,
                "uploader_id": image.uploader_id,
                "steganography_detected": image.status == ImageStatus.QUARANTINED
            }
            for image in images
        ]
    }


def serve_image(filename: str):
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

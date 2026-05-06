from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from database.models import Album, AlbumStatus

async def create_album(title: str, description: str, is_public: bool, owner_id: int, db: Session):
    if description and len(description) > 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La descripción es demasiado larga"
        )
    
    album = Album(
        title=title,
        description=description,
        is_public=is_public,
        owner_id=owner_id,
        status=AlbumStatus.PENDING
    )
    
    db.add(album)
    db.commit()
    db.refresh(album)
    
    return {
        "id": album.id,
        "title": album.title,
        "description": album.description,
        "status": album.status.value,
        "created_at": album.created_at
    }

async def get_user_albums(user_id: int, db: Session):
    albums = db.query(Album).filter(Album.owner_id == user_id).all()
    return [
        {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "status": album.status.value,
            "is_public": album.is_public,
            "created_at": album.created_at
        }
        for album in albums
    ]

async def get_pending_albums(db: Session):
    albums = db.query(Album).filter(Album.status == AlbumStatus.PENDING).all()
    return [
        {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "owner": album.owner.username,
            "created_at": album.created_at
        }
        for album in albums
    ]

async def approve_album(album_id: int, approved: bool, comment: str, reviewer_id: int, db: Session):
    album = db.query(Album).filter(Album.id == album_id).first()
    
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Álbum no encontrado"
        )
    
    album.status = AlbumStatus.APPROVED if approved else AlbumStatus.REJECTED
    album.reviewer_id = reviewer_id
    album.review_comment = comment
    
    db.commit()
    
    return {"mensaje": f"Álbum {'aprobado' if approved else 'rechazado'} exitosamente"}

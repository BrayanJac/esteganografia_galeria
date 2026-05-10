from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from database.models import Album, Image, LoginAttempt, SecurityLog, User, UserRole, AlbumStatus, ImageStatus


def _max_timestamp(values):
    valid_values = [value for value in values if value is not None]
    if not valid_values:
        return None
    return max(valid_values)


def _serialize_datetime(value):
    return value.isoformat() if value else None


def _user_last_activity(user: User):
    album_times = [
        album.updated_at or album.created_at
        for album in user.albums
    ]
    image_times = [
        image.updated_at or image.created_at
        for album in user.albums
        for image in album.images
    ]
    login_times = [attempt.attempted_at for attempt in user.login_attempts]
    return _max_timestamp([user.last_login_attempt, user.created_at] + album_times + image_times + login_times)


def _supervisor_last_activity(supervisor: User, reviewed_albums: list[Album], reviewed_images: list[Image]):
    review_times = [
        album.updated_at or album.created_at
        for album in reviewed_albums
    ] + [
        image.updated_at or image.created_at
        for image in reviewed_images
    ]
    login_times = [
        attempt.attempted_at for attempt in supervisor.login_attempts]
    return _max_timestamp([supervisor.last_login_attempt, supervisor.created_at] + review_times + login_times)


def get_admin_statistics(db: Session):
    users = db.query(User).order_by(User.created_at.desc().nullslast()).all()
    security_events = db.query(SecurityLog).order_by(
        SecurityLog.created_at.desc()).limit(25).all()

    all_albums = db.query(Album).all()
    all_images = db.query(Image).all()

    user_accounts = [user for user in users if user.role == UserRole.USER]
    supervisors = [user for user in users if user.role == UserRole.SUPERVISOR]

    summary = {
        "users": len(user_accounts),
        "supervisors": len(supervisors),
        "albums": len(all_albums),
        "approved_albums": len([album for album in all_albums if album.status == AlbumStatus.APPROVED]),
        "pending_albums": len([album for album in all_albums if album.status == AlbumStatus.PENDING]),
        "images": len(all_images),
        "quarantined_images": len([image for image in all_images if image.status == ImageStatus.QUARANTINED]),
        "login_events": db.query(func.count(SecurityLog.id)).filter(SecurityLog.event_type == "AUTH_LOGIN").scalar() or 0,
        "logout_events": db.query(func.count(SecurityLog.id)).filter(SecurityLog.event_type == "AUTH_LOGOUT").scalar() or 0,
    }

    users_payload = []
    for user in user_accounts:
        login_attempts = list(user.login_attempts)
        albums_created = list(user.albums)
        images_uploaded = [
            image for album in albums_created for image in album.images if image.uploader_id == user.id]

        users_payload.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
            "is_active": user.is_active,
            "created_at": _serialize_datetime(user.created_at),
            "last_login_attempt": _serialize_datetime(user.last_login_attempt),
            "failed_login_attempts": user.failed_login_attempts,
            "login_success_count": len([attempt for attempt in login_attempts if attempt.success]),
            "login_failure_count": len([attempt for attempt in login_attempts if not attempt.success]),
            "album_count": len(albums_created),
            "image_count": len(images_uploaded),
            "last_activity_at": _serialize_datetime(_user_last_activity(user)),
        })

    supervisors_payload = []
    for supervisor in supervisors:
        reviewed_albums = db.query(Album).filter(
            Album.reviewer_id == supervisor.id).all()
        reviewed_images = db.query(Image).filter(
            Image.reviewer_id == supervisor.id).all()
        login_attempts = list(supervisor.login_attempts)

        supervisors_payload.append({
            "id": supervisor.id,
            "username": supervisor.username,
            "email": supervisor.email,
            "role": supervisor.role.value,
            "is_active": supervisor.is_active,
            "created_at": _serialize_datetime(supervisor.created_at),
            "last_login_attempt": _serialize_datetime(supervisor.last_login_attempt),
            "failed_login_attempts": supervisor.failed_login_attempts,
            "login_success_count": len([attempt for attempt in login_attempts if attempt.success]),
            "login_failure_count": len([attempt for attempt in login_attempts if not attempt.success]),
            "reviewed_album_count": len(reviewed_albums),
            "approved_album_count": len([album for album in reviewed_albums if album.status == AlbumStatus.APPROVED]),
            "rejected_album_count": len([album for album in reviewed_albums if album.status == AlbumStatus.REJECTED]),
            "reviewed_image_count": len(reviewed_images),
            "approved_image_count": len([image for image in reviewed_images if image.status == ImageStatus.APPROVED]),
            "rejected_image_count": len([image for image in reviewed_images if image.status == ImageStatus.REJECTED]),
            "last_review_at": _serialize_datetime(_max_timestamp([
                *[album.updated_at or album.created_at for album in reviewed_albums],
                *[image.updated_at or image.created_at for image in reviewed_images],
            ])),
            "last_activity_at": _serialize_datetime(_supervisor_last_activity(supervisor, reviewed_albums, reviewed_images)),
        })

    recent_events = [
        {
            "id": event.id,
            "event_type": event.event_type,
            "description": event.description,
            "user_id": event.user_id,
            "username": event.user.username if event.user else None,
            "severity": event.severity,
            "created_at": _serialize_datetime(event.created_at),
        }
        for event in security_events
    ]

    return {
        "summary": summary,
        "users": users_payload,
        "supervisors": supervisors_payload,
        "recent_events": recent_events,
    }


def get_users_list(db: Session):
    users = db.query(User).order_by(User.created_at.desc().nullslast()).all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
            "is_active": user.is_active,
            "created_at": _serialize_datetime(user.created_at),
            "last_login_attempt": _serialize_datetime(user.last_login_attempt),
        })
    return result


def get_albums_list(db: Session):
    albums = db.query(Album).order_by(Album.created_at.desc()).all()
    result = []
    for album in albums:
        result.append({
            "id": album.id,
            "title": album.title,
            "owner_id": album.owner_id,
            "owner": album.owner.username if album.owner else None,
            "status": album.status.value,
            "is_public": album.is_public,
            "image_count": len(album.images),
            "created_at": _serialize_datetime(album.created_at),
            "updated_at": _serialize_datetime(album.updated_at),
        })
    return result


def get_events(db: Session, direction: str | None = None):
    # direction: 'ingress' => AUTH_LOGIN, 'egress' => AUTH_LOGOUT, None => all
    q = db.query(SecurityLog).order_by(SecurityLog.created_at.desc())
    if direction == 'ingress':
        q = q.filter(SecurityLog.event_type == 'AUTH_LOGIN')
    if direction == 'egress':
        q = q.filter(SecurityLog.event_type == 'AUTH_LOGOUT')

    events = q.limit(200).all()
    out = []
    for event in events:
        out.append({
            "id": event.id,
            "event_type": event.event_type,
            "description": event.description,
            "user_id": event.user_id,
            "username": event.user.username if event.user else None,
            "role": event.user.role.value if event.user else None,
            "ip_address": event.ip_address,
            "created_at": _serialize_datetime(event.created_at),
        })
    return out


def get_user_activity(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # recent security logs for the user
    logs = db.query(SecurityLog).filter(SecurityLog.user_id == user_id).order_by(
        SecurityLog.created_at.desc()).limit(50).all()
    logs_payload = [{
        "id": l.id,
        "event_type": l.event_type,
        "description": l.description,
        "created_at": _serialize_datetime(l.created_at),
    } for l in logs]

    # albums by status
    albums = db.query(Album).filter(Album.owner_id == user_id).all()
    albums_payload = [{
        "id": a.id,
        "title": a.title,
        "status": a.status.value,
        "created_at": _serialize_datetime(a.created_at),
        "updated_at": _serialize_datetime(a.updated_at),
        "image_count": len(a.images)
    } for a in albums]

    # last action: look at latest between security log, album/image create/update timestamps
    last_album_time = max([(a.updated_at or a.created_at)
                          for a in albums] or [None])
    images = [img for a in albums for img in a.images]
    last_image_time = max([(i.updated_at or i.created_at)
                          for i in images] or [None])
    last_log_time = max([l.created_at for l in logs] or [None])

    last_action_time = _max_timestamp(
        [last_album_time, last_image_time, last_log_time])

    # determine last action type by inspecting latest record
    last_action = None
    candidates = []
    if last_album_time:
        candidates.append(('album', last_album_time))
    if last_image_time:
        candidates.append(('image', last_image_time))
    if last_log_time:
        candidates.append(('log', last_log_time))

    if candidates:
        candidates.sort(key=lambda x: x[1], reverse=True)
        last_action = candidates[0][0]

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
            "created_at": _serialize_datetime(user.created_at),
            "last_login_attempt": _serialize_datetime(user.last_login_attempt),
        },
        "albums": albums_payload,
        "recent_logs": logs_payload,
        "last_action": last_action,
        "last_action_at": _serialize_datetime(last_action_time),
    }

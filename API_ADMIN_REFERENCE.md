# API Quick Reference - Admin Endpoints v1.1.0

## 📊 Endpoints Administrativos

### GET /api/admin/stats
**Descripción**: Obtener estadísticas generales del sistema  
**Autorización**: Solo ADMIN  
**Query Params**: None

**Response Example**:
```json
{
  "total_users": 15,
  "total_supervisors": 3,
  "pending_albums": 2,
  "quarantined_images": 1,
  "users_list": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "last_login_attempt": "2026-05-10T14:30:00Z"
    }
  ],
  "supervisors_list": [
    {
      "id": 10,
      "username": "supervisor1",
      "email": "sup1@example.com",
      "role": "supervisor",
      "last_login_attempt": "2026-05-10T15:45:00Z"
    }
  ],
  "recent_events": [
    {
      "event_type": "LOGIN",
      "description": "User john_doe logged in",
      "username": "john_doe",
      "role": "user",
      "timestamp": "2026-05-10T14:30:00Z"
    }
  ]
}
```

---

### GET /api/admin/users
**Descripción**: Obtener lista de todos los usuarios  
**Autorización**: Solo ADMIN  
**Query Params**: None

**Response Example**:
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "last_login_attempt": "2026-05-10T14:30:00Z"
  },
  {
    "id": 2,
    "username": "jane_smith",
    "email": "jane@example.com",
    "role": "user",
    "last_login_attempt": "2026-05-10T13:15:00Z"
  }
]
```

---

### GET /api/admin/albums
**Descripción**: Obtener lista de todos los álbumes  
**Autorización**: Solo ADMIN  
**Query Params**: None

**Response Example**:
```json
[
  {
    "id": 1,
    "title": "Vacaciones 2026",
    "owner": "john_doe",
    "status": "approved",
    "image_count": 5,
    "created_at": "2026-05-05T10:00:00Z",
    "updated_at": "2026-05-10T11:00:00Z"
  },
  {
    "id": 2,
    "title": "Fotos Personales",
    "owner": "jane_smith",
    "status": "pending",
    "image_count": 3,
    "created_at": "2026-05-08T14:30:00Z",
    "updated_at": "2026-05-09T16:45:00Z"
  }
]
```

---

### GET /api/admin/events?direction={ingress|egress}
**Descripción**: Obtener eventos de seguridad  
**Autorización**: Solo ADMIN  
**Query Params**:
- `direction`: (Opcional) `ingress` (LOGIN), `egress` (LOGOUT), o sin especificar (todos)

**Response Example**:
```json
{
  "usuarios": [
    {
      "event_type": "LOGIN",
      "description": "User john_doe logged in",
      "username": "john_doe",
      "timestamp": "2026-05-10T14:30:00Z"
    }
  ],
  "supervisores": [
    {
      "event_type": "LOGIN",
      "description": "Supervisor supervisor1 logged in",
      "username": "supervisor1",
      "timestamp": "2026-05-10T15:00:00Z"
    }
  ],
  "admins": [
    {
      "event_type": "LOGIN",
      "description": "Admin admin1 logged in",
      "username": "admin1",
      "timestamp": "2026-05-10T08:00:00Z"
    }
  ]
}
```

---

### GET /api/admin/users/{user_id}/activity
**Descripción**: Obtener actividad detallada de un usuario  
**Autorización**: Solo ADMIN  
**Path Params**:
- `user_id`: ID del usuario

**Response Example**:
```json
{
  "albums": {
    "approved": 5,
    "rejected": 1,
    "pending": 2
  },
  "recent_logs": [
    {
      "event_type": "LOGIN",
      "description": "User john_doe logged in",
      "timestamp": "2026-05-10T14:30:00Z"
    },
    {
      "event_type": "LOGOUT",
      "description": "User john_doe logged out",
      "timestamp": "2026-05-10T15:45:00Z"
    }
  ],
  "last_action": "album",
  "last_action_at": "2026-05-10T14:30:00Z"
}
```

---

## 🖼️ Endpoints de Imágenes (Actualizado)

### PUT /api/images/{image_id}/comment
**Descripción**: Guardar comentario de imagen sin cambiar estado  
**Autorización**: Solo SUPERVISOR/ADMIN  
**Path Params**:
- `image_id`: ID de la imagen

**Request Body**:
```json
{
  "comment": "Imagen sospechosa, revisar manualmente"
}
```

**Response**:
```json
{
  "id": 5,
  "album_id": 1,
  "filename": "image_001.jpg",
  "review_comment": "Imagen sospechosa, revisar manualmente",
  "status": "quarantined",
  "created_at": "2026-05-10T10:00:00Z"
}
```

---

## 📱 Integración Frontend

### Usando api.ts
```typescript
import api from '@services/api';

// Obtener estadísticas
const stats = await api.getAdminStats();

// Obtener usuarios
const users = await api.getAdminUsers();

// Obtener álbumes
const albums = await api.getAdminAlbums();

// Obtener eventos (todos)
const events = await api.getAdminEvents();

// Obtener eventos por tipo
const logins = await api.getAdminEvents('ingress');
const logouts = await api.getAdminEvents('egress');

// Obtener actividad de usuario
const activity = await api.getAdminUserActivity(userId);

// Guardar comentario en imagen
const result = await api.updateImageComment(imageId, 'Mi comentario');
```

### Usando React Query
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@services/api';

// Query para estadísticas
const { data: stats, isLoading } = useQuery({
  queryKey: ['admin', 'stats'],
  queryFn: () => api.getAdminStats()
});

// Mutation para comentario
const { mutate: saveComment } = useMutation({
  mutationFn: (params: { imageId: number; comment: string }) =>
    api.updateImageComment(params.imageId, params.comment),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['images', 'quarantined'] });
  }
});
```

---

## 🔐 Autorización

Todos los endpoints administrativos requieren:
1. Header `Authorization: Bearer {jwt_token}`
2. El usuario debe tener rol `ADMIN`
3. El token debe ser válido y no expirado

**Error Response** (Unauthorized):
```json
{
  "detail": "Not authenticated"
}
```

**Error Response** (Forbidden):
```json
{
  "detail": "Not authorized"
}
```

---

## ⏰ Zona Horaria

Todos los timestamps se devuelven en UTC, pero se convierten automáticamente a **America/Guayaquil** en el frontend usando:

```typescript
const formatDate = (iso: string) => {
  return new Date(iso).toLocaleString(undefined, {
    timeZone: 'America/Guayaquil'
  });
};
```

---

## 🧪 Ejemplos con curl

### Obtener Estadísticas
```bash
curl -X GET "http://localhost:8000/api/admin/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Obtener Usuarios
```bash
curl -X GET "http://localhost:8000/api/admin/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Obtener Eventos de Ingreso
```bash
curl -X GET "http://localhost:8000/api/admin/events?direction=ingress" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Obtener Actividad de Usuario
```bash
curl -X GET "http://localhost:8000/api/admin/users/1/activity" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Guardar Comentario
```bash
curl -X PUT "http://localhost:8000/api/images/5/comment" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Imagen sospechosa"}'
```

---

## 📊 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (no token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🚀 Performance Notes

- Admin endpoints cache-friendly (use React Query for caching)
- Events endpoint supports filtering by direction
- All responses ordered by most recent timestamp
- User activity includes only last action (not full history)

---

**Last Updated**: Mayo 10, 2026  
**Version**: 1.1.0  
**Backend**: FastAPI  
**Frontend**: React 18 + TypeScript

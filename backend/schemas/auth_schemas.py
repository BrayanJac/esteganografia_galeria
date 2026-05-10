from pydantic import BaseModel, Field, EmailStr


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50,
                          description="Nombre de usuario")
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., min_length=12,
                          description="Contraseña (mínimo 12 caracteres)")


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, description="Nombre de usuario")
    password: str = Field(..., description="Contraseña")


class CreateSupervisorRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50,
                          description="Nombre de usuario del supervisor")
    email: str = Field(..., description="Email del supervisor")
    password: str = Field(..., min_length=12,
                          description="Contraseña (mínimo 12 caracteres)")


class DeleteUserRequest(BaseModel):
    user_id: int = Field(..., description="ID del usuario a eliminar")

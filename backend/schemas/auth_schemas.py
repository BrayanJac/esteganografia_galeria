from pydantic import BaseModel, Field, field_validator


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Nombre de usuario")
    email: str = Field(..., description="Email del usuario")
    password: str = Field(..., min_length=12, description="Contraseña (mínimo 12 caracteres)")

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip()
        if "@" not in value:
            raise ValueError("El email debe contener @")

        local_part, _, domain_part = value.partition("@")
        if not local_part or not domain_part or "." not in domain_part:
            raise ValueError("El email debe tener un dominio válido, por ejemplo usuario@dominio.com")

        return value


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, description="Nombre de usuario")
    password: str = Field(..., description="Contraseña")
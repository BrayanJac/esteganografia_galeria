from pydantic import BaseModel, Field
from typing import Optional


class CreateAlbumRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: bool = Field(default=True)


class ApproveAlbumRequest(BaseModel):
    approved: bool = Field(...)
    comment: Optional[str] = Field(None, max_length=500)

from pydantic import BaseModel, Field
from typing import Optional


class ReviewImageRequest(BaseModel):
    approved: bool = Field(...)
    comment: Optional[str] = Field(None, max_length=500)

import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator


HTML_TAG_PATTERN = re.compile(r"<\s*/?\s*[a-zA-Z!][^>]*>")
DESCRIPTION_VALIDATION_ERROR = "La descripción no puede contener HTML o JavaScript"
JAVASCRIPT_PREFIX = "javascript:"


class CreateAlbumRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: bool = Field(default=True)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        if HTML_TAG_PATTERN.search(value):
            raise ValueError(DESCRIPTION_VALIDATION_ERROR)

        if JAVASCRIPT_PREFIX in value.lower():
            raise ValueError(DESCRIPTION_VALIDATION_ERROR)

        return value


class ApproveAlbumRequest(BaseModel):
    approved: bool = Field(...)
    comment: Optional[str] = Field(None, max_length=500)


class UpdateAlbumRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: Optional[bool] = Field(None)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        if HTML_TAG_PATTERN.search(value):
            raise ValueError(DESCRIPTION_VALIDATION_ERROR)

        if JAVASCRIPT_PREFIX in value.lower():
            raise ValueError(DESCRIPTION_VALIDATION_ERROR)

        return value


class UpdateAlbumReviewRequest(BaseModel):
    is_public: Optional[bool] = Field(None)
    approved: Optional[bool] = Field(None)
    review_comment: Optional[str] = Field(None, max_length=500)

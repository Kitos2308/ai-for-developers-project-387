from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class EventTypeCreateRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    duration_minutes: int = Field(gt=0, le=1440)


class EventTypeUpdateRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    duration_minutes: int | None = Field(default=None, gt=0, le=1440)


class EventTypeResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    duration_minutes: int

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)
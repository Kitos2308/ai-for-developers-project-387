from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CreateBookingRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    start_time: datetime
    guest_name: str | None = Field(default=None, max_length=255)
    guest_email: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None)


class UpdateBookingRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    guest_name: str | None = Field(default=None, max_length=255)
    guest_email: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None)


class BookingResponse(BaseModel):
    id: UUID
    event_type_id: UUID
    start_time: datetime
    end_time: datetime
    guest_name: str | None
    guest_email: str | None
    notes: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)
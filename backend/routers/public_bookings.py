import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_booking_use_case, get_db
from schemas.booking import BookingResponse, CreateBookingRequest
from use_cases.booking import BookingUseCase

router = APIRouter()


@router.post("", response_model=BookingResponse, status_code=201)
def create_booking(
    eventTypeId: uuid.UUID,
    body: CreateBookingRequest,
    db: Session = Depends(get_db),
):
    use_case = get_booking_use_case(db)
    booking = use_case.create(
        event_type_id=eventTypeId,
        start_time=body.start_time,
        guest_name=body.guest_name,
        guest_email=body.guest_email,
        notes=body.notes,
    )
    db.commit()
    return booking
import uuid

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from dependencies import get_booking_use_case, get_db
from schemas.booking import BookingResponse, UpdateBookingRequest
from use_cases.booking import BookingUseCase

router = APIRouter()


@router.get("", response_model=list[BookingResponse])
def list_bookings(
    db: Session = Depends(get_db),
):
    use_case = get_booking_use_case(db)
    result = use_case.list_all()
    db.commit()
    return result


@router.patch("/{id}", response_model=BookingResponse)
def update_booking(
    id: uuid.UUID,
    body: UpdateBookingRequest,
    db: Session = Depends(get_db),
):
    use_case = get_booking_use_case(db)
    result = use_case.update(
        booking_id=id,
        guest_name=body.guest_name,
        guest_email=body.guest_email,
        notes=body.notes,
    )
    db.commit()
    return result


@router.delete("/{id}", status_code=204)
def delete_booking(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    use_case = get_booking_use_case(db)
    use_case.delete(id)
    db.commit()
    return Response(status_code=204)
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_booking_use_case, get_db, get_event_type_use_case
from schemas.event_type import EventTypeResponse
from schemas.slot import CalendarDaySlotsResponse, SlotResponse
from use_cases.booking import BookingUseCase
from use_cases.event_type import EventTypeUseCase

router = APIRouter()


@router.get("", response_model=list[EventTypeResponse])
def list_event_types(
    db: Session = Depends(get_db),
):
    use_case = get_event_type_use_case(db)
    result = use_case.list_all()
    db.commit()
    return result


@router.get("/{id}", response_model=EventTypeResponse)
def get_event_type(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    use_case = get_event_type_use_case(db)
    result = use_case.get_by_id(id)
    db.commit()
    return result


@router.get("/{eventTypeId}/slots", response_model=list[SlotResponse])
def get_slots(
    eventTypeId: uuid.UUID,
    date: str,
    db: Session = Depends(get_db),
):
    use_case = get_booking_use_case(db)
    slots = use_case.get_slots(eventTypeId, date)
    db.commit()
    return slots


@router.get("/{eventTypeId}/calendar", response_model=list[CalendarDaySlotsResponse])
def get_calendar(
    eventTypeId: uuid.UUID,
    month: int,
    year: int,
    db: Session = Depends(get_db),
):
    use_case = get_booking_use_case(db)
    result = use_case.get_calendar(eventTypeId, month, year)
    db.commit()
    return result
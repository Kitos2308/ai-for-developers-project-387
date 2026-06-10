from typing import Generator

from sqlalchemy.orm import Session

from clients.database import SessionLocal
from repositories.booking import BookingRepository
from repositories.event_type import EventTypeRepository
from use_cases.booking import BookingUseCase
from use_cases.event_type import EventTypeUseCase


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session


def get_event_type_use_case(session: Session) -> EventTypeUseCase:
    repo = EventTypeRepository(session)
    return EventTypeUseCase(repo)


def get_booking_use_case(session: Session) -> BookingUseCase:
    booking_repo = BookingRepository(session)
    event_type_repo = EventTypeRepository(session)
    return BookingUseCase(booking_repo, event_type_repo)
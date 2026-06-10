import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.event_type import EventType


class EventTypeRepository:
    def __init__(self, session: Session):
        self.session = session

    def list_all(self) -> list[EventType]:
        result = self.session.execute(select(EventType).order_by(EventType.title))
        return list(result.scalars().all())

    def get_by_id(self, event_type_id: uuid.UUID) -> EventType | None:
        return self.session.get(EventType, event_type_id)

    def create(self, event_type: EventType) -> EventType:
        self.session.add(event_type)
        self.session.flush()
        return event_type

    def update(self, event_type: EventType, data: dict) -> EventType:
        for key, value in data.items():
            if value is not None:
                setattr(event_type, key, value)
        self.session.flush()
        return event_type

    def delete(self, event_type: EventType) -> None:
        self.session.delete(event_type)
        self.session.flush()

    def has_bookings(self, event_type_id: uuid.UUID) -> bool:
        from models.booking import Booking
        result = self.session.execute(
            select(Booking.id).where(Booking.event_type_id == event_type_id).limit(1)
        )
        return result.scalar_one_or_none() is not None
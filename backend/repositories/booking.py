import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.booking import Booking


class BookingRepository:
    def __init__(self, session: Session):
        self.session = session

    def list_all(self) -> list[Booking]:
        result = self.session.execute(select(Booking).order_by(Booking.start_time))
        return list(result.scalars().all())

    def get_by_id(self, booking_id: uuid.UUID) -> Booking | None:
        return self.session.get(Booking, booking_id)

    def create(self, booking: Booking) -> Booking:
        self.session.add(booking)
        self.session.flush()
        return booking

    def update(self, booking: Booking, data: dict) -> Booking:
        for key, value in data.items():
            setattr(booking, key, value)
        self.session.flush()
        return booking

    def delete(self, booking: Booking) -> None:
        self.session.delete(booking)
        self.session.flush()

    def get_overlapping(self, start_time: datetime, end_time: datetime, exclude_id: uuid.UUID | None = None) -> list[Booking]:
        query = select(Booking).where(
            Booking.start_time < end_time,
            Booking.end_time > start_time,
        ).with_for_update()
        if exclude_id:
            query = query.where(Booking.id != exclude_id)
        result = self.session.execute(query)
        return list(result.scalars().all())

    def get_by_event_type_and_date_range(
        self, event_type_id: uuid.UUID, start: datetime, end: datetime
    ) -> list[Booking]:
        result = self.session.execute(
            select(Booking).where(
                Booking.event_type_id == event_type_id,
                Booking.start_time >= start,
                Booking.start_time < end,
            )
        )
        return list(result.scalars().all())

    def get_all_in_range(self, start: datetime, end: datetime) -> list[Booking]:
        result = self.session.execute(
            select(Booking).where(
                Booking.start_time < end,
                Booking.end_time > start,
            )
        )
        return list(result.scalars().all())
import uuid
from datetime import date, datetime, timedelta, timezone

from exceptions import BusinessRuleException, ConflictException, NotFoundException
from repositories.booking import BookingRepository
from repositories.event_type import EventTypeRepository
from schemas.slot import CalendarDaySlotsResponse, SlotResponse

MSK_TZ = timezone(timedelta(hours=3))
WORK_START_HOUR = 9
WORK_END_HOUR = 18
BOOKING_WINDOW_DAYS = 14


def _msc_now() -> datetime:
    return datetime.now(MSK_TZ)


def _msc_today() -> date:
    return _msc_now().date()


def _start_of_day_msk(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, tzinfo=MSK_TZ)


def _generate_slots_for_day(
    d: date,
    duration_minutes: int,
    bookings: list,
    now_msk: datetime,
) -> list[SlotResponse]:
    day_start = _start_of_day_msk(d).replace(hour=WORK_START_HOUR)
    day_end = _start_of_day_msk(d).replace(hour=WORK_END_HOUR)
    slots: list[SlotResponse] = []
    current = day_start
    while current + timedelta(minutes=duration_minutes) <= day_end:
        slot_end = current + timedelta(minutes=duration_minutes)
        if current <= now_msk:
            status = "unavailable"
        else:
            overlap = any(
                b.start_time.replace(tzinfo=timezone.utc).astimezone(MSK_TZ) < slot_end
                and b.end_time.replace(tzinfo=timezone.utc).astimezone(MSK_TZ) > current
                for b in bookings
            )
            status = "booked" if overlap else "available"
        slots.append(SlotResponse(start_time=current, end_time=slot_end, status=status))
        current = slot_end
    return slots


class BookingUseCase:
    def __init__(self, booking_repo: BookingRepository, event_type_repo: EventTypeRepository):
        self.booking_repo = booking_repo
        self.event_type_repo = event_type_repo

    def list_all(self):
        return self.booking_repo.list_all()

    def get_by_id(self, booking_id: uuid.UUID):
        booking = self.booking_repo.get_by_id(booking_id)
        if not booking:
            raise NotFoundException("Booking not found")
        return booking

    def create(self, event_type_id: uuid.UUID, start_time: datetime, guest_name: str | None, guest_email: str | None, notes: str | None):
        event_type = self.event_type_repo.get_by_id(event_type_id)
        if not event_type:
            raise NotFoundException("EventType not found")

        start_msk = start_time.astimezone(MSK_TZ)
        now_msk = _msc_now()
        today_msk = now_msk.date()
        max_date = today_msk + timedelta(days=BOOKING_WINDOW_DAYS)

        if start_msk.date() < today_msk or start_msk.date() > max_date:
            raise BusinessRuleException("Start time is outside the booking window")

        if start_msk.hour < WORK_START_HOUR or start_msk.hour >= WORK_END_HOUR:
            raise BusinessRuleException("Start time is outside working hours")

        start_of_day = _start_of_day_msk(start_msk.date()).replace(hour=WORK_START_HOUR)
        minutes_from_start = (start_msk - start_of_day).total_seconds() / 60
        if minutes_from_start % event_type.duration_minutes != 0:
            raise BusinessRuleException("Start time must align with slot boundaries")

        end_time = start_time + timedelta(minutes=event_type.duration_minutes)
        end_msk = end_time.astimezone(MSK_TZ)
        if end_msk.hour > WORK_END_HOUR or (end_msk.hour == WORK_END_HOUR and end_msk.minute > 0):
            if end_msk > _start_of_day_msk(start_msk.date()).replace(hour=WORK_END_HOUR):
                raise BusinessRuleException("Slot exceeds working hours")

        overlapping = self.booking_repo.get_overlapping(start_time, end_time)
        if overlapping:
            raise ConflictException("Time slot is already booked")

        from models.booking import Booking
        booking = Booking(
            event_type_id=event_type_id,
            start_time=start_time,
            end_time=end_time,
            guest_name=guest_name,
            guest_email=guest_email,
            notes=notes,
        )
        return self.booking_repo.create(booking)

    def update(self, booking_id: uuid.UUID, guest_name: str | None, guest_email: str | None, notes: str | None):
        booking = self.get_by_id(booking_id)
        data = {}
        if guest_name is not None:
            data["guest_name"] = guest_name
        if guest_email is not None:
            data["guest_email"] = guest_email
        if notes is not None:
            data["notes"] = notes
        return self.booking_repo.update(booking, data)

    def delete(self, booking_id: uuid.UUID):
        booking = self.get_by_id(booking_id)
        self.booking_repo.delete(booking)

    def get_slots(self, event_type_id: uuid.UUID, date_str: str) -> list[SlotResponse]:
        event_type = self.event_type_repo.get_by_id(event_type_id)
        if not event_type:
            raise NotFoundException("EventType not found")

        try:
            d = date.fromisoformat(date_str)
        except ValueError:
            raise BusinessRuleException("Invalid date format, expected YYYY-MM-DD")

        now_msk = _msc_now()
        today_msk = now_msk.date()
        max_date = today_msk + timedelta(days=BOOKING_WINDOW_DAYS)

        if d < today_msk or d > max_date:
            raise BusinessRuleException("Date is outside the booking window")

        day_start_utc = datetime(d.year, d.month, d.day, WORK_START_HOUR, tzinfo=MSK_TZ).astimezone(timezone.utc)
        day_end_utc = datetime(d.year, d.month, d.day, WORK_END_HOUR, tzinfo=MSK_TZ).astimezone(timezone.utc)

        bookings = self.booking_repo.get_all_in_range(day_start_utc, day_end_utc)

        return _generate_slots_for_day(d, event_type.duration_minutes, bookings, now_msk)

    def get_calendar(self, event_type_id: uuid.UUID, month: int, year: int) -> list[CalendarDaySlotsResponse]:
        event_type = self.event_type_repo.get_by_id(event_type_id)
        if not event_type:
            raise NotFoundException("EventType not found")

        now_msk = _msc_now()
        today_msk = now_msk.date()
        max_date = today_msk + timedelta(days=BOOKING_WINDOW_DAYS)

        import calendar
        days_in_month = calendar.monthrange(year, month)[1]
        result = []

        month_start = date(year, month, 1)
        month_end = date(year, month, days_in_month)
        range_start_utc = datetime(year, month, 1, WORK_START_HOUR, tzinfo=MSK_TZ).astimezone(timezone.utc)
        range_end_utc = datetime(year, month, days_in_month, WORK_END_HOUR, tzinfo=MSK_TZ).astimezone(timezone.utc)

        all_bookings = self.booking_repo.get_all_in_range(range_start_utc, range_end_utc)

        for day_num in range(1, days_in_month + 1):
            d = date(year, month, day_num)
            if d < today_msk or d > max_date:
                result.append(CalendarDaySlotsResponse(date=d.isoformat(), available_count=0))
            else:
                day_start_utc = datetime(d.year, d.month, d.day, WORK_START_HOUR, tzinfo=MSK_TZ).astimezone(timezone.utc)
                day_end_utc = datetime(d.year, d.month, d.day, WORK_END_HOUR, tzinfo=MSK_TZ).astimezone(timezone.utc)
                day_bookings = [
                    b for b in all_bookings
                    if b.start_time.replace(tzinfo=timezone.utc) < day_end_utc
                    and b.end_time.replace(tzinfo=timezone.utc) > day_start_utc
                ]
                slots = _generate_slots_for_day(d, event_type.duration_minutes, day_bookings, now_msk)
                available = sum(1 for s in slots if s.status == "available")
                result.append(CalendarDaySlotsResponse(date=d.isoformat(), available_count=available))

        return result
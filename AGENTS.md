# Booking Call Service

Минималистичный аналог Cal.com для записи на звонки.

## Language
- общайся и давай ответ на русском

## Stack

### Backend
- Python 3.12
- FastAPI
- PostgreSQL
- SQLAlchemy 2.0
- Alembic
- Redis
- Pydantic v2
- Обязательно создавай в папке backend виртуальное окружение и ставь все зависимости там, а не в системе если не нашел нужных пакетных менеджеров создай pyproject.toml покажи его и после апрува попробуй сделать poetry lock && poetry install

### Frontend
- SvelteKit
- TypeScript
- TailwindCSS

---

## Модели

```text
EventType {
  id: string;
  title: string;
  description?: string;
  durationMinutes: int32;
}

Booking {
  id: string;
  eventTypeId: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  guestName?: string;
  guestEmail?: string;
  notes?: string;
  createdAt: utcDateTime;
}

Slot {                          // вычисляется на лету, не хранится в БД
  startTime: utcDateTime;
  endTime: utcDateTime;
  status: "available" | "booked";
}

CalendarDaySlots {
  date: string;                 // YYYY-MM-DD
  availableCount: int32;
}

EventType (1) ──→ (N) Booking
```

## Бизнес-правила

- Нет авторизации/регистрации; владелец — один захардкоженный профиль
- Окно записи = 14 дней с текущей даты
- Пересекающиеся Booking запрещены (даже разных EventType)
- `endTime = startTime + durationMinutes` из EventType
- Бронь подтверждена автоматически — статуса нет
- Slot вычисляется: 14 дней × таймслоты по durationMinutes, минус занятые Booking

## API

### Public

```
GET    /public/event-types                                    → EventType[]
GET    /public/event-types/{id}                               → EventType
GET    /public/event-types/{eventTypeId}/slots?date=YYYY-MM-DD → Slot[]
GET    /public/event-types/{eventTypeId}/calendar?month=M&year=YYYY → CalendarDaySlots[]
POST   /public/event-types/{eventTypeId}/bookings              → Booking
```

CreateBooking: `{ startTime, guestName?, guestEmail?, notes? }`

### Admin

```
GET    /admin/event-types          → EventType[]
GET    /admin/event-types/{id}     → EventType
POST   /admin/event-types          → EventType
PUT    /admin/event-types/{id}     → EventType
DELETE /admin/event-types/{id}     → void

GET    /admin/bookings             → Booking[]
PATCH  /admin/bookings/{id}        → Booking
DELETE /admin/bookings/{id}        → void
```

CreateEventType: `{ title, description?, durationMinutes }`
UpdateEventType: `{ title?, description?, durationMinutes? }`
UpdateBooking: `{ guestName?, guestEmail?, notes? }`

---

## TypeSpec

```typespec
import "@typespec/http";
using TypeSpec.Http;

@service({ title: "Mini Cal API" })
namespace MiniCal;

model EventType {
  id: string;
  title: string;
  description?: string;
  durationMinutes: int32;
}

model Booking {
  id: string;
  eventTypeId: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  guestName?: string;
  guestEmail?: string;
  notes?: string;
  createdAt: utcDateTime;
}

model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  status: "available" | "booked";
}

model CalendarDaySlots {
  date: string;
  availableCount: int32;
}

model CreateEventTypeRequest {
  title: string;
  description?: string;
  durationMinutes: int32;
}

model UpdateEventTypeRequest {
  title?: string;
  description?: string;
  durationMinutes?: int32;
}

model CreateBookingRequest {
  startTime: utcDateTime;
  guestName?: string;
  guestEmail?: string;
  notes?: string;
}

model UpdateBookingRequest {
  guestName?: string;
  guestEmail?: string;
  notes?: string;
}

@route("/public/event-types")
namespace PublicEventTypes {
  @get op list(): EventType[];
  @get("/{id}") op getById(id: string): EventType;
  @get("/{eventTypeId}/slots") op slots(eventTypeId: string, @query date?: string): Slot[];
  @get("/{eventTypeId}/calendar") op calendar(eventTypeId: string, @query month: int32, @query year: int32): CalendarDaySlots[];
}

@route("/public/event-types/{eventTypeId}/bookings")
namespace PublicBookings {
  @post op create(eventTypeId: string, @body body: CreateBookingRequest): Booking;
}

@route("/admin/event-types")
namespace AdminEventTypes {
  @get op list(): EventType[];
  @get("/{id}") op getById(id: string): EventType;
  @post op create(@body body: CreateEventTypeRequest): EventType;
  @put("/{id}") op update(id: string, @body body: UpdateEventTypeRequest): EventType;
  @delete("/{id}") op remove(id: string): void;
}

@route("/admin/bookings")
namespace AdminBookings {
  @get op list(): Booking[];
  @patch("/{id}") op update(id: string, @body body: UpdateBookingRequest): Booking;
  @delete("/{id}") op remove(id: string): void;
}
```

---

## Layers

```text
Frontend
↓
API Layer
↓
UseCases
↓
Repository Layer
↓
PostgreSQL
```

## Infrastructure and tools

```text
- You can not install additional cli utils in system, only in virtualenv
- Use utils cli via terminal or Makefile
Example:
docker compose 
- If you use cli utils so often then add command in Makefile 
- Almost all utilities in system install via brew

```
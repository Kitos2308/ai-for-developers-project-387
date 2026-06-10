# Обновлённый контракт API — Mini Cal

## Домен

### EventType (Шаблон бронирования)

```text
model EventType {
  id: string;
  title: string;
  description?: string;
  durationMinutes: int32;
}
```

### Booking (Конкретная запись на время)

```text
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
```

### Slot (Виртуальный свободный/занятый слот)

```text
model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  status: "available" | "booked";
}
```

### CalendarDaySlots (Агрегация слотов по дню для календаря)

```text
model CalendarDaySlots {
  date: string;  // YYYY-MM-DD
  availableCount: int32;
}
```

### Связь

```text
EventType (1) ---> (N) Booking
```

Slot не хранится в БД — вычисляется на лету: 14 дней × таймслоты по `durationMinutes` EventType, минус занятые Booking.

---

## Бизнес-правила

- Нет авторизации и регистрации
- Владелец календаря — один заранее заданный профиль (захардкожен на фронте)
- Окно записи = 14 дней начиная с текущей даты
- Нельзя создать пересекающиеся Booking (даже разные EventType)
- Booking всегда принадлежит EventType
- `endTime` вычисляется через `startTime + durationMinutes` из EventType
- Бронь подтверждена автоматически — статуса нет
- Гость записывается без создания аккаунта
- Админские эндпоинты открыты (без авторизации)

---

## Флоу использования

### Владелец (Admin)

1. **Просмотреть типы событий** — `GET /admin/event-types` → список всех EventType
2. **Создать тип события** — `POST /admin/event-types` с `{title, description?, durationMinutes}`
3. **Обновить тип события** — `PUT /admin/event-types/{id}` с полями для обновления
4. **Удалить тип события** — `DELETE /admin/event-types/{id}`
5. **Просмотреть все бронирования** — `GET /admin/bookings` → список всех Booking
6. **Обновить бронирование** — `PATCH /admin/bookings/{id}` с `{guestName?, guestEmail?, notes?}`
7. **Удалить бронирование** — `DELETE /admin/bookings/{id}` — жёсткое удаление, слот освобождается

### Гость (Public)

1. **Просмотреть виды брони** — `GET /public/event-types` → название, описание, длительность
2. **Выбрать тип события** — `GET /public/event-types/{id}` → детали EventType
3. **Посмотреть свободные слоты** — `GET /public/event-types/{eventTypeId}/slots` → Slot[] на 14 дней
4. **Посмотреть слоты по дням** — `GET /public/event-types/{eventTypeId}/slots?date=YYYY-MM-DD` → Slot[] на конкретный день
5. **Посмотреть календарь** — `GET /public/event-types/{eventTypeId}/calendar?month=M&year=YYYY` → CalendarDaySlots[]
6. **Создать бронирование** — `POST /public/event-types/{eventTypeId}/bookings` с `{startTime, guestName?, guestEmail?, notes?}`

---

## API

### Public — Типы событий

```
GET    /public/event-types                     → EventType[]
GET    /public/event-types/{id}                → EventType
```

### Public — Слоты

```
GET    /public/event-types/{eventTypeId}/slots?date=YYYY-MM-DD   → Slot[]
GET    /public/event-types/{eventTypeId}/calendar?month=M&year=YYYY → CalendarDaySlots[]
```

### Public — Бронирования

```
POST   /public/event-types/{eventTypeId}/bookings   → Booking
```

body:
```json
{
  "startTime": "2026-05-27T10:00:00Z",
  "guestName": "Alex",
  "guestEmail": "alex@test.com",
  "notes": "Хочу обсудить проект"
}
```

### Admin — Типы событий

```
GET    /admin/event-types          → EventType[]
GET    /admin/event-types/{id}     → EventType
POST   /admin/event-types          → EventType
PUT    /admin/event-types/{id}     → EventType
DELETE /admin/event-types/{id}     → void
```

### Admin — Бронирования

```
GET    /admin/bookings       → Booking[]
PATCH  /admin/bookings/{id}  → Booking
DELETE /admin/bookings/{id}  → void
```

PATCH body:
```json
{
  "guestName": "Alex Updated",
  "guestEmail": "alex2@test.com",
  "notes": "Обновлённые заметки"
}
```

---

## TypeSpec

```typespec
import "@typespec/http";

using TypeSpec.Http;

@service({
  title: "Mini Cal API"
})
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

  @get
  op list(): EventType[];

  @get("/{id}")
  op getById(id: string): EventType;

  @get("/{eventTypeId}/slots")
  op slots(eventTypeId: string, @query date?: string): Slot[];

  @get("/{eventTypeId}/calendar")
  op calendar(eventTypeId: string, @query month: int32, @query year: int32): CalendarDaySlots[];
}

@route("/public/event-types/{eventTypeId}/bookings")
namespace PublicBookings {

  @post
  op create(
    eventTypeId: string,
    @body body: CreateBookingRequest
  ): Booking;
}

@route("/admin/event-types")
namespace AdminEventTypes {

  @get
  op list(): EventType[];

  @get("/{id}")
  op getById(id: string): EventType;

  @post
  op create(@body body: CreateEventTypeRequest): EventType;

  @put("/{id}")
  op update(
    id: string,
    @body body: UpdateEventTypeRequest
  ): EventType;

  @delete("/{id}")
  op remove(id: string): void;
}

@route("/admin/bookings")
namespace AdminBookings {

  @get
  op list(): Booking[];

  @patch("/{id}")
  op update(
    id: string,
    @body body: UpdateBookingRequest
  ): Booking;

  @delete("/{id}")
  op remove(id: string): void;
}
```

---

## Отличия от my.local.md (оригинальной спецификации)

| # | Что изменилось | Было | Стало |
|---|---|---|---|
| 1 | Slot.status | `available: boolean` | `status: "available" \| "booked"` |
| 2 | Booking.notes | — | `notes?: string` |
| 3 | Booking.status | — (не было) | Не добавлен — бронь сразу подтверждена |
| 4 | CalendarDaySlots | — (не было) | Новая модель для агрегации по дням |
| 5 | GET /slots | Без параметров | Добавлен `?date=` для фильтрации по дню |
| 6 | GET /calendar | — (не было) | Новый endpoint с `?month=&year=` |
| 7 | PATCH /admin/bookings/{id} | — (не было) | Обновление guestName, guestEmail, notes |
| 8 | DELETE /admin/bookings/{id} | — (не было) | Жёсткое удаление, слот освобождается |
| 9 | UpdateBookingRequest | — (не было) | Новая модель |
| 10 | CreateBookingRequest.notes | — | Добавлено `notes?: string` |
import { test, expect } from '../../fixtures/api.fixture';
import { VALID_EVENT_TYPE, futureSlotTime, futureSlotTimeUTC, INVALID_UUID } from '../../fixtures/test-data';

test.describe('Public Bookings API', () => {
  let eventTypeId: string;
  let bookingId: string;

  test.beforeEach(async ({ api }) => {
    const res = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    const body = await res.json();
    eventTypeId = body.id;
    bookingId = '';
  });

  test.afterEach(async ({ api }) => {
    if (bookingId) {
      await api.delete(`/admin/bookings/${bookingId}`).catch(() => {});
    }
    if (eventTypeId) {
      await api.delete(`/admin/event-types/${eventTypeId}`).catch(() => {});
    }
  });

  test('POST /public/event-types/{id}/bookings — создаёт бронирование со всеми полями', async ({ api }) => {
    const startTime = futureSlotTime(1, 10);
    const res = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: {
        startTime,
        guestName: 'Тестовый Гость',
        guestEmail: 'test@test.com',
        notes: 'Тестовая заметка',
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.eventTypeId).toBe(eventTypeId);
    expect(body.guestName).toBe('Тестовый Гость');
    expect(body.guestEmail).toBe('test@test.com');
    expect(body.notes).toBe('Тестовая заметка');
    expect(body).toHaveProperty('startTime');
    expect(body).toHaveProperty('endTime');
    expect(body).toHaveProperty('createdAt');
    bookingId = body.id;
  });

  test('POST — бронирование без опциональных полей', async ({ api }) => {
    const startTime = futureSlotTime(1, 11);
    const res = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.guestName).toBeNull();
    expect(body.guestEmail).toBeNull();
    bookingId = body.id;
  });

  test('POST — endTime = startTime + durationMinutes', async ({ api }) => {
    const startTime = futureSlotTime(1, 12);
    const res = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const start = new Date(body.startTime);
    const end = new Date(body.endTime);
    const diffMinutes = (end.getTime() - start.getTime()) / 60000;
    expect(diffMinutes).toBe(VALID_EVENT_TYPE.durationMinutes);
    bookingId = body.id;
  });

  test('POST — 404 для несуществующего eventType', async ({ api }) => {
    const startTime = futureSlotTime(1, 10);
    const res = await api.post(`/public/event-types/${INVALID_UUID}/bookings`, {
      data: { startTime },
    });
    expect(res.status()).toBe(404);
  });

  test('POST — 422 для времени вне рабочих часов (рано утром)', async ({ api }) => {
    const startTime = futureSlotTimeUTC(1, 4);
    const res = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime },
    });
    expect(res.status()).toBe(422);
  });

  test('POST — 422 для времени за пределами окна бронирования (далёкое будущее)', async ({ api }) => {
    const startTime = futureSlotTime(20, 10);
    const res = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime },
    });
    expect(res.status()).toBe(422);
  });

  test('POST — 409 для пересекающегося бронирования', async ({ api }) => {
    const startTime = futureSlotTime(1, 10);
    const res1 = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime, guestName: 'Первый' },
    });
    expect(res1.status()).toBe(201);
    bookingId = (await res1.json()).id;

    const res2 = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime, guestName: 'Второй' },
    });
    expect(res2.status()).toBe(409);
  });

  test('POST — 422 для времени не на границе слота', async ({ api }) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 15, 0, 0);
    const startTime = d.toISOString();
    const res = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime },
    });
    expect(res.status()).toBe(422);
  });

  test('POST — 422 для времени вне рабочих часов (поздний вечер)', async ({ api }) => {
    const startTime = futureSlotTimeUTC(1, 18);
    const res = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime },
    });
    expect(res.status()).toBe(422);
  });
});
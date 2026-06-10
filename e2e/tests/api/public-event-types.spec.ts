import { test, expect } from '../../fixtures/api.fixture';
import { VALID_EVENT_TYPE, futureDate, INVALID_UUID, MALFORMED_UUID } from '../../fixtures/test-data';

test.describe('Public Event Types API', () => {
  let createdEventTypeId: string;

  test.beforeEach(async ({ api }) => {
    const res = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    expect(res.status()).toBe(201);
    const body = await res.json();
    createdEventTypeId = body.id;
  });

  test.afterEach(async ({ api }) => {
    if (createdEventTypeId) {
      await api.delete(`/admin/event-types/${createdEventTypeId}`).catch(() => {});
    }
  });

  test('GET /public/event-types — возвращает список типов событий', async ({ api }) => {
    const res = await api.get('/public/event-types');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('title');
    expect(body[0]).toHaveProperty('durationMinutes');
  });

  test('GET /public/event-types — возвращает пустой список если нет типов', async ({ api }) => {
    const bookingsRes = await api.get('/admin/bookings');
    const allBookings = await bookingsRes.json();
    for (const b of allBookings) {
      await api.delete(`/admin/bookings/${b.id}`).catch(() => {});
    }

    const allRes = await api.get('/admin/event-types');
    const allTypes = await allRes.json();
    for (const et of allTypes) {
      await api.delete(`/admin/event-types/${et.id}`).catch(() => {});
    }

    const res = await api.get('/public/event-types');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });

  test('GET /public/event-types/{id} — возвращает тип по ID', async ({ api }) => {
    const res = await api.get(`/public/event-types/${createdEventTypeId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(createdEventTypeId);
    expect(body.title).toBe(VALID_EVENT_TYPE.title);
    expect(body.durationMinutes).toBe(VALID_EVENT_TYPE.durationMinutes);
    expect(body).toHaveProperty('description');
  });

  test('GET /public/event-types/{id} — 404 для несуществующего ID', async ({ api }) => {
    const res = await api.get(`/public/event-types/${INVALID_UUID}`);
    expect(res.status()).toBe(404);
  });

  test('GET /public/event-types/{id} — 422 для невалидного UUID', async ({ api }) => {
    const res = await api.get(`/public/event-types/${MALFORMED_UUID}`);
    expect(res.status()).toBe(422);
  });

  test('GET /public/event-types/{id}/slots — возвращает слоты на завтрашнюю дату', async ({ api }) => {
    const dateStr = futureDate(1);
    const res = await api.get(`/public/event-types/${createdEventTypeId}/slots?date=${dateStr}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('startTime');
      expect(body[0]).toHaveProperty('endTime');
      expect(['available', 'booked', 'unavailable']).toContain(body[0].status);
    }
  });

  test('GET /public/event-types/{id}/slots — 422 для невалидного формата даты', async ({ api }) => {
    const res = await api.get(`/public/event-types/${createdEventTypeId}/slots?date=invalid-date`);
    expect(res.status()).toBe(422);
  });

  test('GET /public/event-types/{id}/slots — 422 для прошедшей даты', async ({ api }) => {
    const res = await api.get(`/public/event-types/${createdEventTypeId}/slots?date=2020-01-01`);
    expect(res.status()).toBe(422);
  });

  test('GET /public/event-types/{id}/slots — 404 для несуществующего eventType', async ({ api }) => {
    const dateStr = futureDate(1);
    const res = await api.get(`/public/event-types/${INVALID_UUID}/slots?date=${dateStr}`);
    expect(res.status()).toBe(404);
  });

  test('GET /public/event-types/{id}/calendar — возвращает календарь на текущий месяц', async ({ api }) => {
    const now = new Date();
    const res = await api.get(
      `/public/event-types/${createdEventTypeId}/calendar?month=${now.getMonth() + 1}&year=${now.getFullYear()}`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    body.forEach((day: any) => {
      expect(day).toHaveProperty('date');
      expect(day).toHaveProperty('availableCount');
      expect(typeof day.availableCount).toBe('number');
    });
  });

  test('GET /public/event-types/{id}/calendar — 404 для несуществующего eventType', async ({ api }) => {
    const now = new Date();
    const res = await api.get(
      `/public/event-types/${INVALID_UUID}/calendar?month=${now.getMonth() + 1}&year=${now.getFullYear()}`
    );
    expect(res.status()).toBe(404);
  });
});
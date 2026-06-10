import { test, expect } from '../../fixtures/api.fixture';
import { VALID_EVENT_TYPE, futureSlotTime, INVALID_UUID } from '../../fixtures/test-data';

test.describe('Admin Bookings API', () => {
  let eventTypeId: string;
  let bookingId: string;

  test.beforeEach(async ({ api }) => {
    const etRes = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    eventTypeId = (await etRes.json()).id;

    const startTime = futureSlotTime(1, 10);
    const bRes = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime, guestName: 'Гость', guestEmail: 'guest@test.com', notes: 'Заметка' },
    });
    bookingId = (await bRes.json()).id;
  });

  test.afterEach(async ({ api }) => {
    await api.delete(`/admin/bookings/${bookingId}`).catch(() => {});
    await api.delete(`/admin/event-types/${eventTypeId}`).catch(() => {});
  });

  test('GET /admin/bookings — возвращает список бронирований', async ({ api }) => {
    const res = await api.get('/admin/bookings');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
    const booking = body.find((b: any) => b.id === bookingId);
    expect(booking).toBeDefined();
    expect(booking.eventTypeId).toBe(eventTypeId);
  });

  test('GET /admin/bookings — бронирование содержит все поля', async ({ api }) => {
    const res = await api.get('/admin/bookings');
    const body = await res.json();
    const booking = body.find((b: any) => b.id === bookingId);
    expect(booking).toHaveProperty('id');
    expect(booking).toHaveProperty('eventTypeId');
    expect(booking).toHaveProperty('startTime');
    expect(booking).toHaveProperty('endTime');
    expect(booking).toHaveProperty('guestName');
    expect(booking).toHaveProperty('guestEmail');
    expect(booking).toHaveProperty('notes');
    expect(booking).toHaveProperty('createdAt');
  });

  test('PATCH /admin/bookings/{id} — обновляет данные гостя', async ({ api }) => {
    const res = await api.patch(`/admin/bookings/${bookingId}`, {
      data: { guestName: 'Новое Имя', notes: 'Новая заметка' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.guestName).toBe('Новое Имя');
    expect(body.notes).toBe('Новая заметка');
    expect(body.guestEmail).toBe('guest@test.com');
  });

  test('PATCH — частичное обновление (только notes)', async ({ api }) => {
    const res = await api.patch(`/admin/bookings/${bookingId}`, {
      data: { notes: 'Обновлённая заметка' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.notes).toBe('Обновлённая заметка');
    expect(body.guestName).toBe('Гость');
  });

  test('PATCH /admin/bookings/{id} — 404 для несуществующего', async ({ api }) => {
    const res = await api.patch(`/admin/bookings/${INVALID_UUID}`, {
      data: { guestName: 'Тест' },
    });
    expect(res.status()).toBe(404);
  });

  test('DELETE /admin/bookings/{id} — удаляет бронирование', async ({ api }) => {
    const listBefore = await api.get('/admin/bookings');
    const bodyBefore = await listBefore.json();
    const countBefore = bodyBefore.length;

    const res = await api.delete(`/admin/bookings/${bookingId}`);
    expect(res.status()).toBe(204);
    bookingId = '';

    const listAfter = await api.get('/admin/bookings');
    const bodyAfter = await listAfter.json();
    expect(bodyAfter.length).toBe(countBefore - 1);
  });

  test('DELETE /admin/bookings/{id} — 404 для несуществующего', async ({ api }) => {
    const res = await api.delete(`/admin/bookings/${INVALID_UUID}`);
    expect(res.status()).toBe(404);
  });
});
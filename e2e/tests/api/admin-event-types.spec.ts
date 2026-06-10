import { test, expect } from '../../fixtures/api.fixture';
import { VALID_EVENT_TYPE, VALID_EVENT_TYPE_60, futureSlotTime, INVALID_UUID } from '../../fixtures/test-data';

test.describe('Admin Event Types API', () => {
  let eventTypeId: string;

  test.afterEach(async ({ api }) => {
    if (eventTypeId) {
      const bookingsRes = await api.get('/admin/bookings');
      const bookings = await bookingsRes.json();
      for (const b of bookings.filter((b: any) => b.eventTypeId === eventTypeId)) {
        await api.delete(`/admin/bookings/${b.id}`).catch(() => {});
      }
      await api.delete(`/admin/event-types/${eventTypeId}`).catch(() => {});
    }
  });

  test('POST /admin/event-types — создаёт тип события', async ({ api }) => {
    const res = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.title).toBe(VALID_EVENT_TYPE.title);
    expect(body.durationMinutes).toBe(VALID_EVENT_TYPE.durationMinutes);
    expect(body).toHaveProperty('id');
    eventTypeId = body.id;
  });

  test('POST — создаёт с description', async ({ api }) => {
    const res = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE_60 });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.description).toBe(VALID_EVENT_TYPE_60.description);
    eventTypeId = body.id;
  });

  test('POST — создаёт без description', async ({ api }) => {
    const res = await api.post('/admin/event-types', {
      data: { title: 'Без описания', durationMinutes: 30 },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.title).toBe('Без описания');
    expect(body.description).toBeNull();
    eventTypeId = body.id;
  });

  test('POST — 422 при пустом title', async ({ api }) => {
    const res = await api.post('/admin/event-types', {
      data: { title: '', durationMinutes: 30 },
    });
    expect(res.status()).toBe(422);
  });

  test('POST — 422 при durationMinutes = 0', async ({ api }) => {
    const res = await api.post('/admin/event-types', {
      data: { title: 'Тест', durationMinutes: 0 },
    });
    expect(res.status()).toBe(422);
  });

  test('POST — 422 при durationMinutes > 1440', async ({ api }) => {
    const res = await api.post('/admin/event-types', {
      data: { title: 'Тест', durationMinutes: 1500 },
    });
    expect(res.status()).toBe(422);
  });

  test('GET /admin/event-types — возвращает список', async ({ api }) => {
    const createRes = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    eventTypeId = (await createRes.json()).id;

    const res = await api.get('/admin/event-types');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /admin/event-types/{id} — возвращает тип по ID', async ({ api }) => {
    const createRes = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    eventTypeId = (await createRes.json()).id;

    const res = await api.get(`/admin/event-types/${eventTypeId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(eventTypeId);
  });

  test('GET /admin/event-types/{id} — 404 для несуществующего', async ({ api }) => {
    const res = await api.get(`/admin/event-types/${INVALID_UUID}`);
    expect(res.status()).toBe(404);
  });

  test('PUT /admin/event-types/{id} — обновляет title и description', async ({ api }) => {
    const createRes = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    eventTypeId = (await createRes.json()).id;

    const res = await api.put(`/admin/event-types/${eventTypeId}`, {
      data: { title: 'Обновленное название', description: 'Новое описание' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Обновленное название');
    expect(body.description).toBe('Новое описание');
  });

  test('PUT — частичное обновление (только title)', async ({ api }) => {
    const createRes = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    eventTypeId = (await createRes.json()).id;

    const res = await api.put(`/admin/event-types/${eventTypeId}`, {
      data: { title: 'Новое имя' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Новое имя');
    expect(body.durationMinutes).toBe(VALID_EVENT_TYPE.durationMinutes);
  });

  test('PUT /admin/event-types/{id} — 404 для несуществующего', async ({ api }) => {
    const res = await api.put(`/admin/event-types/${INVALID_UUID}`, {
      data: { title: 'Тест' },
    });
    expect(res.status()).toBe(404);
  });

  test('DELETE /admin/event-types/{id} — удаляет без бронирований', async ({ api }) => {
    const createRes = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    const id = (await createRes.json()).id;
    eventTypeId = '';

    const res = await api.delete(`/admin/event-types/${id}`);
    expect(res.status()).toBe(204);

    const getRes = await api.get(`/admin/event-types/${id}`);
    expect(getRes.status()).toBe(404);
  });

  test('DELETE — 404 для несуществующего', async ({ api }) => {
    const res = await api.delete(`/admin/event-types/${INVALID_UUID}`);
    expect(res.status()).toBe(404);
  });

  test('DELETE — 409 если есть бронирования', async ({ api }) => {
    const createRes = await api.post('/admin/event-types', { data: VALID_EVENT_TYPE });
    eventTypeId = (await createRes.json()).id;

    const startTime = futureSlotTime(1, 10);
    const bookingRes = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime, guestName: 'Гость' },
    });
    const bookingId = (await bookingRes.json()).id;

    const res = await api.delete(`/admin/event-types/${eventTypeId}`);
    expect(res.status()).toBe(409);

    await api.delete(`/admin/bookings/${bookingId}`).catch(() => {});
  });
});
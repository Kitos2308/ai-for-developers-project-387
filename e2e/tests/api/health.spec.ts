import { test, expect } from '../../fixtures/api.fixture';

test.describe('Health API', () => {
  test('GET /health — возвращает статус ok', async ({ api }) => {
    const res = await api.get('/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});
import { test, expect } from '@playwright/test';
import { AdminEventTypesPage } from '../../pages/admin-event-types.page';

test.describe('Админ: Типы событий (UI)', () => {
  let adminPage: AdminEventTypesPage;
  let api: any;
  const createdIds: string[] = [];

  test.beforeEach(async ({ page, playwright }) => {
    adminPage = new AdminEventTypesPage(page);
    api = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    await adminPage.goto();
  });

  test.afterEach(async () => {
    for (const id of createdIds) {
      await api.delete(`/admin/event-types/${id}`).catch(() => {});
    }
    createdIds.length = 0;
  });

  test('отображает заголовок «Типы событий»', async () => {
    await expect(adminPage.heading).toBeVisible();
  });

  test('открывает модалку создания при нажатии «+ Добавить»', async ({ page }) => {
    await adminPage.clickAdd();
    await expect(adminPage.modal.title).toBeVisible();
    const title = await adminPage.modal.getTitle();
    expect(title).toContain('Новый тип события');
  });

  test('создаёт новый тип события через модалку', async ({ page }) => {
    await adminPage.clickAdd();
    await adminPage.form.fillForm({
      title: 'UI Тест EventType',
      description: 'Создан через UI',
      durationMinutes: 45,
    });
    await adminPage.form.save();

    await expect(page.getByText('UI Тест EventType')).toBeVisible({ timeout: 5000 });

    const listRes = await api.get('/admin/event-types');
    const eventTypes = await listRes.json();
    const created = eventTypes.find((et: any) => et.title === 'UI Тест EventType');
    if (created) {
      createdIds.push(created.id);
    }
    expect(created).toBeDefined();
  });

  test('удаляет тип события через кнопку «Удалить»', async ({ page }) => {
    const res = await api.post('/admin/event-types', {
      data: { title: 'Для удаления UI', durationMinutes: 15 },
      headers: { 'Content-Type': 'application/json' },
    });
    const { id } = await res.json();

    await adminPage.goto();
    await page.waitForTimeout(1000);

    await adminPage.clickDelete(0);
    await page.waitForTimeout(2000);

    const checkRes = await api.get(`/admin/event-types/${id}`);
    expect(checkRes.status()).toBe(404);
  });
});
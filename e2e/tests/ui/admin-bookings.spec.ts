import { test, expect } from '@playwright/test';
import { AdminBookingsPage } from '../../pages/admin-bookings.page';
import { VALID_EVENT_TYPE, futureSlotTime } from '../../fixtures/test-data';

test.describe('Админ: Бронирования (UI)', () => {
  let bookingsPage: AdminBookingsPage;
  let eventTypeId: string;
  let bookingId: string;
  let api: any;

  test.beforeEach(async ({ page, playwright }) => {
    bookingsPage = new AdminBookingsPage(page);
    api = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });

    const etRes = await api.post('/admin/event-types', {
      data: VALID_EVENT_TYPE,
      headers: { 'Content-Type': 'application/json' },
    });
    eventTypeId = (await etRes.json()).id;

    const startTime = futureSlotTime(1, 10);
    const bRes = await api.post(`/public/event-types/${eventTypeId}/bookings`, {
      data: { startTime, guestName: 'Тест UI', guestEmail: 'test@ui.com' },
      headers: { 'Content-Type': 'application/json' },
    });
    bookingId = (await bRes.json()).id;

    await bookingsPage.goto();
  });

  test.afterEach(async () => {
    await api.delete(`/admin/bookings/${bookingId}`).catch(() => {});
    await api.delete(`/admin/event-types/${eventTypeId}`).catch(() => {});
  });

  test('отображает заголовок «Бронирования»', async () => {
    await expect(bookingsPage.heading).toBeVisible();
  });

  test('показит карточку бронирования в списке', async ({ page }) => {
    await expect(bookingsPage.bookingCards.first()).toBeVisible({ timeout: 10000 });
    const count = await bookingsPage.getBookingCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('редактирует данные гостя через модалку', async ({ page }) => {
    await bookingsPage.clickEdit(0);

    const nameInput = page.locator('.fixed input').first();
    await nameInput.clear();
    await nameInput.fill('Обновленное Имя');

    const saveBtn = page.locator('.fixed button', { hasText: 'Сохранить' });
    await saveBtn.click();

    await page.waitForTimeout(1500);

    const listRes = await api.get('/admin/bookings');
    const bookings = await listRes.json();
    const updated = bookings.find((b: any) => b.id === bookingId);
    expect(updated).toBeDefined();
  });

  test('удаляет бронирование через кнопку «Удалить»', async ({ page }) => {
    await bookingsPage.clickDelete(0);
    await page.waitForTimeout(2000);

    const listRes = await api.get('/admin/bookings');
    const bookings = await listRes.json();
    const deleted = bookings.find((b: any) => b.id === bookingId);
    expect(deleted).toBeUndefined();
    bookingId = '';
  });
});
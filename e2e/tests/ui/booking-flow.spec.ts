import { test, expect } from '@playwright/test';
import { BookPage } from '../../pages/book.page';
import { BookEventPage } from '../../pages/book-event.page';
import { VALID_EVENT_TYPE } from '../../fixtures/test-data';

test.describe('Пользовательский сценарий: Бронирование (UI)', () => {
  let bookPage: BookPage;
  let bookEventPage: BookEventPage;
  let eventTypeId: string;
  let apiRequest: any;

  test.beforeAll(async ({ playwright }) => {
    apiRequest = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });

    const res = await apiRequest.post('/admin/event-types', {
      data: VALID_EVENT_TYPE,
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await res.json();
    eventTypeId = body.id;
  });

  test.afterAll(async () => {
    if (eventTypeId) {
      await apiRequest.delete(`/admin/event-types/${eventTypeId}`).catch(() => {});
    }
  });

  test.beforeEach(async ({ page }) => {
    bookPage = new BookPage(page);
    bookEventPage = new BookEventPage(page);
  });

  test('US-2: видит список типов событий на странице /book', async ({ page }) => {
    await bookPage.goto();
    await expect(bookPage.eventTypeCards.first()).toBeVisible({ timeout: 10000 });
    const count = await bookPage.getEventTypeCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('US-3: выбирает дату и видит доступные слоты', async ({ page }) => {
    await bookEventPage.goto(eventTypeId);
    await expect(bookEventPage.heading).toBeVisible();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await bookEventPage.calendar.selectDay(tomorrow.getDate());
    await page.waitForTimeout(1500);

    const availableCount = await bookEventPage.calendar.availableSlots.count();
    const bookedCount = await bookEventPage.calendar.bookedSlots.count();
    expect(availableCount + bookedCount).toBeGreaterThan(0);
  });

  test('US-3: выбирает слот и нажимает «Продолжить» — открывается форма', async ({ page }) => {
    await bookEventPage.goto(eventTypeId);
    await expect(bookEventPage.heading).toBeVisible();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await bookEventPage.calendar.selectDay(tomorrow.getDate());
    await page.waitForTimeout(1500);

    const availableCount = await bookEventPage.calendar.availableSlots.count();
    if (availableCount === 0) {
      test.skip();
      return;
    }

    await bookEventPage.calendar.selectFirstAvailableSlot();
    await bookEventPage.calendar.clickContinue();

    await expect(bookEventPage.bookingForm.selectedTimeLabel).toBeVisible({ timeout: 5000 });
  });

  test('US-4: полный флоу бронирования — от выбора слота до подтверждения', async ({ page, playwright }) => {
    const api = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });

    await bookEventPage.goto(eventTypeId);
    await expect(bookEventPage.heading).toBeVisible();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await bookEventPage.calendar.selectDay(tomorrow.getDate());
    await page.waitForTimeout(1500);

    const availableCount = await bookEventPage.calendar.availableSlots.count();
    if (availableCount === 0) {
      test.skip();
      return;
    }

    await bookEventPage.calendar.selectFirstAvailableSlot();
    await bookEventPage.calendar.clickContinue();

    await expect(bookEventPage.bookingForm.selectedTimeLabel).toBeVisible({ timeout: 5000 });

    await bookEventPage.bookingForm.fillForm({
      guestName: 'UI Тест Гость',
      guestEmail: 'ui-test@example.com',
      notes: 'Заметка из UI теста',
    });
    await bookEventPage.bookingForm.submit();

    await expect(bookEventPage.successMessage).toBeVisible({ timeout: 15000 });

    const listRes = await api.get('/admin/bookings');
    const bookings = await listRes.json();
    const created = bookings.find((b: any) => b.guestName === 'UI Тест Гость');
    if (created) {
      await api.delete(`/admin/bookings/${created.id}`);
    }
  });
});
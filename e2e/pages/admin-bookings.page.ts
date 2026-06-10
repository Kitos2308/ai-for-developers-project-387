import { Page, Locator } from '@playwright/test';

export class AdminBookingsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly bookingCards: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Бронирования/i });
    this.bookingCards = page.locator('[class*="space-y-4"] > div');
    this.emptyState = page.getByText(/Нет бронирований/i);
  }

  async goto() {
    await this.page.goto('/admin/bookings');
  }

  async clickEdit(index: number) {
    const buttons = this.page.locator('button', { hasText: 'Изменить' });
    await buttons.nth(index).click();
  }

  async clickDelete(index: number) {
    this.page.on('dialog', (dialog) => dialog.accept());
    const buttons = this.page.locator('button', { hasText: 'Удалить' });
    await buttons.nth(index).click();
  }

  async getBookingCount() {
    return await this.bookingCards.count();
  }
}
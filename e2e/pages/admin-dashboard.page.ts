import { Page, Locator } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly eventTypesCount: Locator;
  readonly bookingsCount: Locator;
  readonly eventTypesLink: Locator;
  readonly bookingsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Админка/i });
    this.eventTypesCount = page.locator('p.text-3xl').first();
    this.bookingsCount = page.locator('p.text-3xl').nth(1);
    this.eventTypesLink = page.getByRole('link', { name: /Типы событий/i });
    this.bookingsLink = page.getByRole('link', { name: /Бронирования/i });
  }

  async goto() {
    await this.page.goto('/admin');
  }
}
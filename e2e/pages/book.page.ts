import { Page, Locator } from '@playwright/test';

export class BookPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly eventTypeCards: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading');
    this.eventTypeCards = page.locator('a[href^="/book/"]');
    this.emptyState = page.getByText(/Нет типов событий/i);
  }

  async goto() {
    await this.page.goto('/book');
  }

  async clickEventType(index: number = 0) {
    await this.eventTypeCards.nth(index).click();
  }

  async getEventTypeCount() {
    return await this.eventTypeCards.count();
  }
}
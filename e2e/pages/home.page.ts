import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly bookButton: Locator;
  readonly navBookLink: Locator;
  readonly navAdminLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Calendar/i });
    this.bookButton = page.getByRole('link', { name: /Записаться/i });
    this.navBookLink = page.locator('nav').getByRole('link', { name: /Записаться/i });
    this.navAdminLink = page.locator('nav').getByRole('link', { name: /Админка/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickBookButton() {
    await this.bookButton.first().click();
  }

  async clickAdminLink() {
    await this.navAdminLink.click();
  }
}
import { Page, Locator } from '@playwright/test';

export class ModalComponent {
  readonly page: Page;
  readonly overlay: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.overlay = page.locator('.fixed.inset-0');
    this.title = page.locator('.fixed .border-b h3');
    this.closeButton = page.locator('.fixed button').filter({ hasText: /✕/ }).or(page.locator('.fixed button').first());
  }

  async isOpen() {
    return await this.overlay.isVisible();
  }

  async getTitle() {
    return await this.title.textContent();
  }

  async close() {
    if (await this.closeButton.isVisible()) {
      await this.closeButton.click();
    }
  }
}
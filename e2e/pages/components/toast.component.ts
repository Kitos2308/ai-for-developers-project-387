import { Page, Locator } from '@playwright/test';

export class ToastComponent {
  readonly page: Page;
  readonly toastMessage: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toastMessage = page.locator('[class*="toast"], [class*="Toast"], .fixed[class*="z-50"]');
    this.errorToast = page.locator('[class*="toast"][class*="error"], [class*="Toast"][class*="error"]');
  }

  async getToastText() {
    return await this.toastMessage.first().textContent();
  }

  async isErrorVisible() {
    return await this.errorToast.isVisible().catch(() => false);
  }

  async waitForToast() {
    await this.toastMessage.first().waitFor({ state: 'visible', timeout: 5000 });
  }
}
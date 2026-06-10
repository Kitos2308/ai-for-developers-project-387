import { Page, Locator } from '@playwright/test';

export class CalendarComponent {
  readonly page: Page;
  readonly prevMonthBtn: Locator;
  readonly nextMonthBtn: Locator;
  readonly dayButtons: Locator;
  readonly availableSlots: Locator;
  readonly bookedSlots: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly noSlotsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.prevMonthBtn = page.locator('button').filter({ has: page.locator('path[d="M15 19l-7-7 7-7"]') }).first();
    this.nextMonthBtn = page.locator('button').filter({ has: page.locator('path[d="M9 5l7 7-7 7"]') }).first();
    this.dayButtons = page.locator('.grid.grid-cols-7.gap-1 button');
    this.availableSlots = page.locator('button').filter({ hasText: /Свободно/ });
    this.bookedSlots = page.locator('button').filter({ hasText: /Занято/ });
    this.continueButton = page.getByRole('button', { name: /Продолжить/i });
    this.backButton = page.getByRole('button', { name: /Назад/i }).first();
    this.noSlotsMessage = page.getByText(/Нет доступных слотов|Выберите дату/i);
  }

  async selectDay(dayNumber: number) {
    const buttons = this.dayButtons;
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).textContent();
      if (text?.trim().startsWith(String(dayNumber))) {
        await buttons.nth(i).click();
        return;
      }
    }
  }

  async selectFirstAvailableSlot() {
    await this.availableSlots.first().click();
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async clickNextMonth() {
    await this.nextMonthBtn.click();
  }

  async clickPrevMonth() {
    await this.prevMonthBtn.click();
  }
}
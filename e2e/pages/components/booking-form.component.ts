import { Page, Locator } from '@playwright/test';

export class BookingFormComponent {
  readonly page: Page;
  readonly guestNameInput: Locator;
  readonly guestEmailInput: Locator;
  readonly notesTextarea: Locator;
  readonly submitButton: Locator;
  readonly backButton: Locator;
  readonly selectedTimeLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.guestNameInput = page.locator('label:has-text("Имя") + input');
    this.guestEmailInput = page.locator('input[type="email"]').first();
    this.notesTextarea = page.getByPlaceholder(/Дополнительная информация/i);
    this.submitButton = page.getByRole('button', { name: /Забронировать/i });
    this.backButton = page.getByRole('button', { name: /Назад/i }).first();
    this.selectedTimeLabel = page.getByText(/Выбранное время/i);
  }

  async fillForm(data: { guestName?: string; guestEmail?: string; notes?: string }) {
    if (data.guestName) await this.guestNameInput.fill(data.guestName);

    if (data.guestEmail && (await this.guestEmailInput.count()) > 0) {
      await this.guestEmailInput.fill(data.guestEmail);
    }

    if (data.notes) await this.notesTextarea.fill(data.notes);
  }

  async submit() {
    await this.submitButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }
}
import { Page, Locator } from '@playwright/test';

export class EventTypeFormComponent {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly durationInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('label:has-text("Название") + input');
    this.descriptionTextarea = page.getByPlaceholder(/Краткое описание/i);
    this.durationInput = page.locator('label:has-text("Длительность") + input');
    this.saveButton = page.getByRole('button', { name: /Сохранить/i });
    this.cancelButton = page.getByRole('button', { name: /Отмена/i }).last();
  }

  async fillForm(data: { title: string; description?: string; durationMinutes?: number }) {
    await this.titleInput.fill(data.title);
    if (data.description !== undefined) {
      await this.descriptionTextarea.fill(data.description);
    }
    if (data.durationMinutes !== undefined) {
      await this.durationInput.clear();
      await this.durationInput.fill(String(data.durationMinutes));
    }
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
import { Page, Locator } from '@playwright/test';
import { EventTypeFormComponent } from './components/event-type-form.component';
import { ModalComponent } from './components/modal.component';

export class AdminEventTypesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addButton: Locator;
  readonly eventTypeCards: Locator;
  readonly emptyState: Locator;
  readonly form: EventTypeFormComponent;
  readonly modal: ModalComponent;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Типы событий/i });
    this.addButton = page.getByRole('button', { name: /\+ Добавить/i });
    this.eventTypeCards = page.locator('[class*="space-y-4"] > div');
    this.emptyState = page.getByText(/Нет типов событий/i);
    this.form = new EventTypeFormComponent(page);
    this.modal = new ModalComponent(page);
  }

  async goto() {
    await this.page.goto('/admin/event-types');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAdd() {
    await this.addButton.waitFor({ state: 'visible' });
    await this.addButton.click();
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

  async getEventTypeCount() {
    return await this.eventTypeCards.count();
  }
}
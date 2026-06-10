import { Page, Locator } from '@playwright/test';
import { CalendarComponent } from './components/calendar.component';
import { BookingFormComponent } from './components/booking-form.component';

export class BookEventPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly successMessage: Locator;
  readonly bookAgainLink: Locator;
  readonly calendar: CalendarComponent;
  readonly bookingForm: BookingFormComponent;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1').first();
    this.successMessage = page.getByText(/Бронирование подтверждено/i);
    this.bookAgainLink = page.getByRole('link', { name: /Записаться ещё/i });
    this.calendar = new CalendarComponent(page);
    this.bookingForm = new BookingFormComponent(page);
  }

  async goto(eventTypeId: string) {
    await this.page.goto(`/book/${eventTypeId}`);
  }

  async isSuccessVisible() {
    return await this.successMessage.isVisible();
  }
}
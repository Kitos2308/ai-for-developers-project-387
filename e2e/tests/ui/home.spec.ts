import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test.describe('Главная страница', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('отображает заголовок Calendar', async () => {
    await expect(homePage.heading).toBeVisible();
  });

  test('кнопка «Записаться» ведёт на /book', async ({ page }) => {
    await homePage.clickBookButton();
    await expect(page).toHaveURL(/\/book/);
  });

  test('ссылка «Админка» ведёт на /admin', async ({ page }) => {
    await homePage.clickAdminLink();
    await expect(page).toHaveURL(/\/admin/);
  });
});
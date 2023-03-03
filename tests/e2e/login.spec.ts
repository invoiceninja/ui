import { test, expect } from '@playwright/test';

test('login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('user@example.com');
  await page.getByLabel('Password').fill('password');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('h2')).toContainText('Dashboard');
});
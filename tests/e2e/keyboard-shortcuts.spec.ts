import { login } from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test, expect } from '$tests/e2e/fixtures';

resetAccountBeforeAll();

test('creation keyboard shortcuts navigate to create pages', async ({
  page,
}) => {
  await login(page);

  const shortcuts = [
    { key: 'X', path: '/recurring_expenses/create' },
    { key: 'E', path: '/expenses/create' },
  ];

  for (const shortcut of shortcuts) {
    await page.goto('/dashboard');
    await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible({
      timeout: 10000,
    });

    await page.keyboard.press(`Control+Shift+${shortcut.key}`);
    await page.waitForURL(`**${shortcut.path}`, { timeout: 10000 });
  }
});

test('keyboard shortcuts can be reused after route changes', async ({
  page,
}) => {
  await login(page);

  await page.goto('/dashboard');
  await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible({
    timeout: 10000,
  });

  await page.keyboard.press('Control+Shift+X');
  await page.waitForURL('**/recurring_expenses/create', { timeout: 10000 });
  await expect(
    page.getByRole('heading', { name: 'New Recurring Expense' }).first()
  ).toBeVisible({ timeout: 10000 });

  await page.keyboard.press('Control+Shift+A');
  await page.waitForURL('**/transactions/create', { timeout: 10000 });
});

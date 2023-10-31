import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test("can't view tasks without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Tasks'
  );
});

test('can view tasks', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_task');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Tasks', exact: true }).click();

  await page.waitForURL('**/tasks');

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

// test("can't create a task", async ({ page }) => {
//   const { clear, save, set } = permissions(page);

//   await login(page);
//   await clear();
//   await set('view_task');
//   await save();
//   await logout(page);

//   await login(page, 'permissions@example.com', 'password');

//   await page.getByRole('link', { name: 'Tasks', exact: true }).click();
//   await page.getByText('New Task').click();

//   await expect(
//     page.getByRole('heading', {
//       name: "Sorry, you don't have the needed permissions.",
//     })
//   ).toBeVisible();
// });

test('can create a task', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_task');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Tasks', exact: true }).click();
  await page.getByText('New Task').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test('can view assigned task with create_task', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_task');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Tasks' }).click();
  await page.getByRole('main').getByRole('link', { name: 'New Task' }).click();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('heading', { name: 'Edit Task' })).toBeVisible();
});

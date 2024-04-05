import { Permissions as TPermissions } from '$app/common/hooks/permissions/useHasPermission';
import { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Action } from './clients.spec';

type AdminPermission = 'admin';

export type Permission = TPermissions | AdminPermission;

export async function logout(page: Page) {
  await page.goto('/logout');

  await page.waitForURL('**/login');
}

export async function login(
  page: Page,
  email = 'user@example.com',
  password = 'password'
) {
  await page.waitForTimeout(500);
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Password').press('Enter');

  await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible();
}

export function permissions(page: Page) {
  const clear = async (email = 'permissions@example.com') => {
    await page.getByRole('link', { name: 'Settings' }).click();
    await page.getByRole('link', { name: 'User Management' }).click();
    await page.locator('#filter').fill(email);

    await page.waitForTimeout(1000);

    const tableBody = page.locator('tbody').first();

    await tableBody.getByRole('link').first().click();

    await page.getByLabel('Current password*').fill('password');
    await page.locator('#current_password').press('Tab');

    await page.getByLabel('Current password*').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Permissions' }).click();

    await page.uncheck('[data-cy="admin"]');
    await page.uncheck('[data-cy="viewDashboard"]');
    await page.uncheck('[data-cy="viewReports"]');

    for (const checkbox of await page.locator('input[type=checkbox]').all()) {
      await checkbox.uncheck();
    }
  };

  const save = async () => {
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByText('Successfully updated user').isVisible();

    await page.waitForTimeout(500);
  };

  const set = async (...permissions: Permission[]) => {
    for (const p of permissions) {
      let updatedPermission = p;

      if (updatedPermission === 'view_dashboard') {
        updatedPermission = 'viewDashboard' as Permission;
      }

      if (updatedPermission === 'view_reports') {
        updatedPermission = 'viewReports' as Permission;
      }

      await page.check(`[data-cy=${updatedPermission}]`);
    }
  };

  return { clear, save, set };
}

export async function checkTableEditability(page: Page, isEditable: boolean) {
  const tableContainer = page.locator('[data-cy="dataTable"]');
  const table = tableContainer.getByRole('table');
  const tableBody = table.locator('tbody');

  await page.waitForTimeout(200);

  const numberOfTableMoreActionDropdowns = await tableContainer
    .getByRole('button')
    .filter({ has: page.getByText('More Actions') })
    .count();
  const numberOfTableCheckboxes = await tableContainer
    .locator('input[type="checkbox"]')
    .count();
  const numberOfTableRows = await tableBody.locator('tr').count();

  let expectedNumberOfDropdowns = 0;
  let expectedNumberOfCheckboxes = 0;

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (isEditable) {
    expectedNumberOfDropdowns = doRecordsExist ? numberOfTableRows + 1 : 1;
    expectedNumberOfCheckboxes = doRecordsExist ? numberOfTableRows + 1 : 1;
  }

  expect(numberOfTableCheckboxes).toEqual(expectedNumberOfCheckboxes);
  expect(expectedNumberOfDropdowns).toEqual(numberOfTableMoreActionDropdowns);
}

export async function checkDropdownActions(
  page: Page,
  actions: Action[],
  dropdownId: string,
  containerId?: string,
  withOutOpening?: boolean
) {
  if (!withOutOpening) {
    await page
      .locator(`[data-cy=${containerId || 'topNavbar'}]`)
      .getByRole('button', { name: 'More Actions', exact: true })
      .first()
      .click();
  }

  const dropDown = page.locator(`[data-cy=${dropdownId}]`);

  for (const { label, visible, modal } of actions) {
    if (visible) {
      await expect(dropDown.getByText(label).first()).toBeVisible();

      if (modal) {
        await page.getByText(label).first().click();

        await expect(page.getByText(modal.title).first()).toBeVisible();

        for (const modalAction of modal.actions) {
          if (modalAction.visible) {
            await expect(
              page.getByText(modalAction.label).first()
            ).toBeVisible();
          } else {
            await expect(
              page.getByText(modalAction.label).first()
            ).not.toBeVisible();
          }
        }

        await page.locator(`[data-cy=${modal.dataCyXButton}]`).click();

        await expect(page.getByText(modal.title).first()).not.toBeVisible();
      }
    } else {
      await expect(dropDown.getByText(label).first()).not.toBeVisible();
    }
  }
}

export function useHasPermission({
  permissions,
}: {
  permissions: Permission[];
}) {
  const isAdmin = permissions.includes('admin');

  return (permission: Permission) => {
    return isAdmin || permissions.includes(permission);
  };
}

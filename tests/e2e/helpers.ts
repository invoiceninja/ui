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

    const passwordField = page.locator('#current_password');
    const permissionsButton = page.getByRole('button', { name: 'Permissions' });

    // Wait for either the password modal or the Permissions tab to appear.
    // If password is not required, the app auto-confirms and goes straight to the edit page.
    await Promise.race([
      passwordField.waitFor({ state: 'visible', timeout: 5000 }),
      permissionsButton.waitFor({ state: 'visible', timeout: 5000 }),
    ]);

    if (await passwordField.isVisible()) {
      await passwordField.fill('password');
      await page.getByRole('button', { name: 'Continue' }).click();
      await permissionsButton.waitFor({ state: 'visible', timeout: 5000 });
    }

    await permissionsButton.click();

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

/**
 * Wait for the data table to finish loading.
 * Resolves once either "No records found" or actual table rows with links are visible.
 * Returns true if records exist, false if "No records found" is showing.
 */
export async function waitForTableData(page: Page): Promise<boolean> {
  const dataTable = page.locator('[data-cy="dataTable"]');
  await dataTable.waitFor({ state: 'visible', timeout: 10000 });

  // Wait for either "No records found" or a real data row to appear
  await Promise.race([
    page.getByText('No records found').waitFor({ state: 'visible', timeout: 15000 }),
    dataTable.locator('tbody tr a').first().waitFor({ state: 'visible', timeout: 15000 }),
  ]).catch(() => {
    // Timeout is OK — we'll check state below
  });

  return page.getByText('No records found').isHidden();
}

export async function checkTableEditability(page: Page, isEditable: boolean) {
  const tableContainer = page.locator('[data-cy="dataTable"]');

  // Wait for table to finish loading (spinner to disappear)
  await tableContainer.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1500);

  const headerCheckbox = tableContainer.locator('thead input[type="checkbox"]');
  const rowActionButtons = tableContainer.locator(
    'tbody button'
  ).filter({ has: page.getByText('Actions') });

  if (isEditable) {
    // Header checkbox should be visible when table is editable
    await expect(headerCheckbox.first()).toBeVisible();
  } else {
    // No checkboxes or action buttons when not editable
    expect(await headerCheckbox.count()).toEqual(0);
    expect(await rowActionButtons.count()).toEqual(0);
  }
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
      .getByRole('button', { name: 'Actions', exact: true })
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

        // Re-open the dropdown since closing the modal also closes it
        const chevron = page.locator('[data-cy="chevronDownButton"]').first();
        if (await chevron.isVisible()) {
          await chevron.click();
          await dropDown.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
        }
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

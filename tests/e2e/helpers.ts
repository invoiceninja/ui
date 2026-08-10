import { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Action } from './clients.spec';
import type { Permission as ApiPermission } from './api-helpers';
import {
  emailForCurrentAccount,
  passwordForCurrentAccount,
} from './accounts';

export type Permission = ApiPermission;

export async function logout(page: Page) {
  // The /logout component calls window.location.href='/' in a useEffect, which
  // fires after the load event and interrupts goto('/logout'). Suppress that
  // error — the browser still completes the redirect chain (/logout → / → /login).
  await page.goto('/logout').catch(() => {});

  // Wait for the full redirect chain to land on /login.
  await page.waitForURL('**/login', { timeout: 15000 });

  // Wait for the login form to be rendered and interactive before returning,
  // so that any subsequent login() call doesn't race with ongoing page setup.
  await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 10000 });
}

export async function login(
  page: Page,
  email = 'user@example.com',
  password = 'password'
) {
  const resolvedEmail = emailForCurrentAccount(email);
  const resolvedPassword = passwordForCurrentAccount(password);

  // Only navigate to /login when not already there. logout() already lands on
  // /login with the form ready, so a redundant goto() would cause a needless
  // full-page reload that can race with ongoing page initialisation.
  if (!page.url().includes('/login')) {
    await page.goto('/login');
  }

  await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('input[name="email"]').fill(resolvedEmail);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(resolvedPassword);
  await passwordInput.press('Enter');

  await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible({ timeout: 10000 });
}

/**
 * Wait for the data table to finish loading.
 * Resolves once either "No records found" or actual table rows with links are visible.
 * Returns true if records exist, false if "No records found" is showing.
 */
export async function waitForTableData(page: Page): Promise<boolean> {
  const dataTable = page.locator('[data-cy="dataTable"]');
  await dataTable.waitFor({ state: 'visible', timeout: 5000 });

  // Wait for either "No records found" or a real data row to appear
  await Promise.any([
    page.getByText('No records found').waitFor({ state: 'visible', timeout: 5000 }),
    dataTable.locator('tbody tr a').first().waitFor({ state: 'visible', timeout: 5000 }),
  ]).catch(() => {
    // Timeout is OK — we'll check state below
  });

  return page.getByText('No records found').isHidden();
}

export async function checkTableEditability(page: Page, isEditable: boolean) {
  const tableContainer = page.locator('[data-cy="dataTable"]');

  await tableContainer.waitFor({ state: 'visible', timeout: 5000 });

  const headerCheckbox = tableContainer.locator('thead input[type="checkbox"]');
  const rowActionButtons = tableContainer.locator(
    'tbody button'
  ).filter({ has: page.getByText('Actions') });

  if (isEditable) {
    // Header checkbox should be visible when table is editable
    await expect(headerCheckbox.first()).toBeVisible({ timeout: 10000 });
  } else {
    // No checkboxes or action buttons when not editable
    expect(await headerCheckbox.count()).toEqual(0);
    expect(await rowActionButtons.count()).toEqual(0);
  }
}

export async function checkDropdownActions(
  page: Page,
  actions: Action[],
  dropdownId?: string,
  containerId?: string,
  withOutOpening?: boolean
) {
  if (!withOutOpening) {
    const container = page.locator(`[data-cy=${containerId || 'topNavbar'}]`);

    if (containerId === 'dataTable') {
      const bulkActionsTrigger = container.locator('[data-cy="bulkActionsTrigger"]');

      await expect(bulkActionsTrigger).toBeVisible({ timeout: 10000 });
      await bulkActionsTrigger.click();
    } else {
      await container
        .getByRole('button', { name: 'Actions', exact: true })
        .first()
        .click();
    }
  }

  const dropDown = dropdownId
    ? page.locator(`[data-cy=${dropdownId}]`)
    : containerId === 'dataTable'
    ? page.locator('[data-cy="bulkActionsDropdown"]')
    : page.locator('[data-tippy-root]:visible');
  await dropDown.waitFor({ state: 'visible', timeout: 5000 });

  for (const { label, visible, modal } of actions) {
    const buttonAction = dropDown
      .getByRole('button', { name: label, exact: true })
      .first();
    const linkAction = dropDown
      .getByRole('link', { name: label, exact: true })
      .first();
    const action = (await buttonAction.count())
      ? buttonAction
      : (await linkAction.count())
      ? linkAction
      : dropDown.getByText(label).first();

    if (visible) {
      await expect(action).toBeVisible({ timeout: 10000 });

      if (modal) {
        await action.click();

        const modalDialog = page.getByRole('dialog');
        await modalDialog.waitFor({ state: 'visible', timeout: 5000 });

        await expect(modalDialog.getByText(modal.title).first()).toBeVisible({ timeout: 10000 });

        for (const modalAction of modal.actions) {
          if (modalAction.visible) {
            await expect(
              modalDialog.getByText(modalAction.label, { exact: true }).first()
            ).toBeVisible({ timeout: 10000 });
          } else {
            await expect(
              modalDialog.getByText(modalAction.label, { exact: true }).first()
            ).not.toBeVisible({ timeout: 10000 });
          }
        }

        await page.locator(`[data-cy=${modal.dataCyXButton}]`).click();

        await expect(modalDialog).not.toBeVisible({ timeout: 10000 });

        // Re-open the dropdown since closing the modal also closes it
        const chevron = page.locator('[data-cy="chevronDownButton"]').first();
        if (await chevron.isVisible()) {
          await chevron.click();
          await dropDown.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
        }
      }
    } else {
      await expect(dropDown.getByText(label).first()).not.toBeVisible({ timeout: 10000 });
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

/**
 * Select an assigned user from a UserSelector / Settings "User" combobox.
 * Filters by first name and requires exactly one matching option so duplicate
 * display names (lane orphans) fail loudly instead of assigning the wrong user.
 */
export async function selectAssignedUser(
  page: Page,
  assignTo: string,
  input: Locator
) {
  await input.scrollIntoViewIfNeeded();
  await input.click();

  const filter = assignTo.split(' ')[0];
  // Some comboboxes are click-to-open only; fill when the control accepts text.
  if (await input.isEditable().catch(() => false)) {
    await input.fill(filter);
  }

  const options = page.getByRole('option', { name: assignTo, exact: true });
  await expect(
    options,
    `Expected exactly one assignee option for "${assignTo}" after filtering`
  ).toHaveCount(1, { timeout: 5000 });
  await options.click();
}

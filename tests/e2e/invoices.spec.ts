import {
  Permission,
  checkDropdownActions,
  checkTableEditability,
  login,
  logout,
  permissions,
  useHasPermission,
} from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';
import { Action } from './clients.spec';

interface Params {
  permissions: Permission[];
}
export function useInvoiceActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Enter Payment',
      visible: hasPermission('create_payment'),
    },
    {
      label: 'Clone',
      visible: hasPermission('create_invoice'),
    },
    {
      label: 'Clone to Quote',
      visible: hasPermission('create_quote'),
    },
    {
      label: 'Clone to Credit',
      visible: hasPermission('create_credit'),
    },
    {
      label: 'Clone to Recurring',
      visible: hasPermission('create_recurring_invoice'),
    },
    {
      label: 'Clone to PO',
      visible: hasPermission('create_purchase_order'),
    },
  ];

  return actions;
}
const createInvoice = async (page: Page, assignTo?: string) => {
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice' })
    .click();

  await page.waitForTimeout(1200);

  await page.getByRole('option').first().click();

  if (assignTo) {
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByLabel('User').click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();
};

test.skip("can't view invoices without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Invoices'
  );

  await logout(page);
});

test.skip('can view invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('view_invoice', 'view_client');
  await save();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await createInvoice(page);

  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await page.waitForURL('**/invoices/**/edit');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).not.toBeVisible();

  await expect(
    page.locator('[data-cy="moreActionsChevronDown"]')
  ).not.toBeVisible();

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('button', { name: 'Custom Fields', exact: true })
  ).not.toBeVisible();

  await logout(page);
});

test('can edit invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['edit_invoice'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('edit_invoice', 'view_client');
  await save();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await createInvoice(page);

  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await checkTableEditability(page, true);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await page.waitForURL('**/invoices/**/edit');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible();

  await expect(
    page.locator('[data-cy="moreActionsChevronDown"]')
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('button', { name: 'Custom Fields', exact: true })
  ).not.toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated invoice', { exact: true })
  ).toBeVisible();

  await page.locator('button[data-cy="moreActionsChevronDown"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown');

  await logout(page);
});

test.skip('can create a invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['create_invoice'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await checkTableEditability(page, false);

  await createInvoice(page);

  await page.waitForURL('**/invoices/**/edit');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible();

  await expect(
    page.locator('[data-cy="moreActionsChevronDown"]')
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('button', { name: 'Custom Fields', exact: true })
  ).not.toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated invoice', { exact: true })
  ).toBeVisible();

  await page.locator('button[data-cy="moreActionsChevronDown"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown');

  await logout(page);
});

test.skip('can view and edit assigned invoice with create_invoice', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['create_client'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_client');
  await save();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await createInvoice(page, 'Invoices Example');

  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: 'test assigned client', exact: true })
    .first()
    .click();

  await page.waitForURL('**/clients/**');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('link', { name: 'Edit Client', exact: true })
  ).toBeVisible();

  await expect(
    page.locator('[data-cy="moreActionsChevronDown"]')
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('link', { name: 'Edit Client', exact: true })
    .click();

  await page.waitForURL('**/clients/**/edit');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible();

  await expect(
    page.locator('[data-cy="moreActionsChevronDown"]')
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Company Details', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Contacts', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Address', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Additional Info', exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated client', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="moreActionsChevronDown"]').click();

  await checkDropdownActions(page, actions, 'clientActionDropdown');

  await logout(page);
});

test.skip('deleting invoice with edit_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'edit_invoice');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/invoices');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted invoice')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted invoice')).toBeVisible();
  }
});

test.skip('archiving invoice withe edit_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'edit_invoice');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived invoice')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived invoice')).toBeVisible();
  }
});

test.skip('invoice documents preview with edit_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'edit_invoice');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/invoices/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await page.waitForURL('**/invoices/**/documents');

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test.skip('invoice documents uploading with edit_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'edit_invoice');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }
  await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/invoices/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await page.waitForURL('**/invoices/**/documents');

  await page
    .locator('input[type="file"]')
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible();

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible();
});

test.skip('all actions in dropdown displayed with admin permission', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await checkTableEditability(page, true);

  await createInvoice(page);

  await expect(
    page.getByRole('heading', { name: 'test dropdown invoice', exact: true })
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('link', { name: 'Documents', exact: true })
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('button', { name: 'Custom Fields', exact: true })
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible();

  await expect(
    page.locator('[data-cy="moreActionsChevronDown"]')
  ).toBeVisible();

  await page.locator('[data-cy="moreActionsChevronDown"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown');

  await logout(page);
});

test.skip('New Invoice, New Purchase Order, and Clone displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['create_invoice', 'create_purchase_order', 'create_invoice'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'create_purchase_order', 'create_invoice');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await createInvoice(page);

  await expect(
    page.getByRole('heading', { name: 'test actions invoice', exact: true })
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('link', { name: 'Documents', exact: true })
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('button', { name: 'Custom Fields', exact: true })
  ).not.toBeVisible();

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible();

  await expect(
    page.locator('[data-cy="moreActionsChevronDown"]')
  ).toBeVisible();

  await page.locator('[data-cy="moreActionsChevronDown"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown');

  await logout(page);
});

test.skip('cloning invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/invoices/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created invoice')).toBeVisible();

  await page.waitForURL('**/invoices/**/edit**');

  await expect(
    page.getByRole('heading', { name: 'Edit Invoice' }).first()
  ).toBeVisible();
});

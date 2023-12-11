import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';
import exp from 'constants';

test("Activity test", async ({ page }) => {

    await login(page);

    await page
        .locator('[data-cy="navigationBar"]')
        .getByRole('link', { name: 'Reports', exact: true })
        .click();

    await page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'More Actions', exact: true })
        .click();

    await page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Schedule', exact: true })
        .click();

    await expect(page.locator('section')
    .filter({ hasText: 'ActivityCustomerContactCreditDocumentExpenseInvoiceInvoice ItemPurchase' })
    .getByRole('combobox'))
    .toBeVisible();

    await expect(page.locator('section')
    .filter({ hasText: 'ActivityCustomerContactCreditDocumentExpenseInvoiceInvoice ItemPurchase' })
    .getByRole('combobox'))
    .toContainText('Activity');


    const selectedValue = await page.locator('section')
        .filter({ hasText: 'ActivityCustomerContactCreditDocumentExpenseInvoiceInvoice ItemPurchase' })
        .getByRole('combobox').textContent();

    expect(selectedValue === 'Activity');

    await page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
        .click();

    await expect(
        page.locator('h2')
            .filter({ hasText: 'Edit Schedule' })).toBeVisible();

});

import { login } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';
import dayjs from 'dayjs';

test('Activity report test', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'Last 7 Days' });

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'activity'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'last7_days'
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'activity'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'last7_days'
  );

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Invoice report test', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Invoice' });

  await page.locator('[id="status_selector"]').click();

  await page.getByText('Draft').click();

  await page.waitForTimeout(200);

  await page.locator('[id="status_selector"]').click();

  await page.getByText('Paid').first().click();

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'Custom' });

  await page.waitForTimeout(200);

  await page.fill('[data-cy="reportStartDate"]', dayjs().format('YYYY-MM-DD'));

  await page.fill(
    '[data-cy="reportEndDate"]',
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'invoice'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'custom'
  );
  await expect(page.locator('[data-cy="scheduleStartDate"]')).toHaveValue(
    dayjs().format('YYYY-MM-DD')
  );
  await expect(page.locator('[data-cy="scheduleEndDate"]')).toHaveValue(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  await expect(page.locator('[id="status_selector"]')).toContainText(
    'DraftPaid'
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'invoice'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'custom'
  );
  await expect(page.locator('[data-cy="scheduleStartDate"]')).toHaveValue(
    dayjs().format('YYYY-MM-DD')
  );
  await expect(page.locator('[data-cy="scheduleEndDate"]')).toHaveValue(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  await expect(page.locator('[id="status_selector"]')).toContainText(
    'DraftPaid'
  );

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Profit and loss report test', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Profit and Loss' });

  await page.locator('[data-cy="expenseBilled"]').check();
  await page.locator('[data-cy="incomeBilled"]').check();
  await page.locator('[data-cy="includeTax"]').check();

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'This Month' });

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'profitloss'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="expenseBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="incomeBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="includeTax"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'this_month'
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'profitloss'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="expenseBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="incomeBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="includeTax"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'this_month'
  );

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { RecurringInvoicesFrequency } from '$app/common/enums/recurring-invoices-frequency';

export default {
  [RecurringInvoicesFrequency.FREQUENCY_ANNUALLY]: 'freq_annually',
  [RecurringInvoicesFrequency.FREQUENCY_DAILY]: 'freq_daily',
  [RecurringInvoicesFrequency.FREQUENCY_FOUR_MONTHS]: 'freq_four_months',
  [RecurringInvoicesFrequency.FREQUENCY_FOUR_WEEKS]: 'freq_four_weeks',
  [RecurringInvoicesFrequency.FREQUENCY_MONTHLY]: 'freq_monthly',
  [RecurringInvoicesFrequency.FREQUENCY_SIX_MONTHS]: 'freq_six_months',
  [RecurringInvoicesFrequency.FREQUENCY_THREE_MONTHS]: 'freq_three_months',
  [RecurringInvoicesFrequency.FREQUENCY_THREE_YEARS]: 'freq_three_years',
  [RecurringInvoicesFrequency.FREQUENCY_TWO_MONTHS]: 'freq_two_months',
  [RecurringInvoicesFrequency.FREQUENCY_TWO_WEEKS]: 'freq_two_weeks',
  [RecurringInvoicesFrequency.FREQUENCY_TWO_YEARS]: 'freq_two_years',
  [RecurringInvoicesFrequency.FREQUENCY_WEEKLY]: 'freq_weekly',
  [RecurringInvoicesFrequency.RECURS_INDEFINITELY]: 'freq_indefinetley',
};

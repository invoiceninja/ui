/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringExpensesFrequency } from 'common/enums/recurring-expense-frequency';

export default {
  [RecurringExpensesFrequency.FREQUENCY_ANNUALLY]: 'freq_annually',
  [RecurringExpensesFrequency.FREQUENCY_DAILY]: 'freq_daily',
  [RecurringExpensesFrequency.FREQUENCY_FOUR_MONTHS]: 'freq_four_months',
  [RecurringExpensesFrequency.FREQUENCY_FOUR_WEEKS]: 'freq_four_weeks',
  [RecurringExpensesFrequency.FREQUENCY_MONTHLY]: 'freq_monthly',
  [RecurringExpensesFrequency.FREQUENCY_SIX_MONTHS]: 'freq_six_months',
  [RecurringExpensesFrequency.FREQUENCY_THREE_MONTHS]: 'freq_three_months',
  [RecurringExpensesFrequency.FREQUENCY_THREE_YEARS]: 'freq_three_years',
  [RecurringExpensesFrequency.FREQUENCY_TWO_MONTHS]: 'freq_two_months',
  [RecurringExpensesFrequency.FREQUENCY_TWO_WEEKS]: 'freq_two_weeks',
  [RecurringExpensesFrequency.FREQUENCY_TWO_YEARS]: 'freq_two_years',
  [RecurringExpensesFrequency.FREQUENCY_WEEKLY]: 'freq_weekly',
};

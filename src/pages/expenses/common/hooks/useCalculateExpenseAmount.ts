/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Expense } from '$app/common/interfaces/expense';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';

export function useCalculateExpenseAmount() {
  return (expense: Expense | RecurringExpense) => {
    if (expense.uses_inclusive_taxes) {
      return expense.amount;
    }

    if (expense.calculate_tax_by_amount) {
      return (
        expense.amount +
        expense.tax_amount1 +
        expense.tax_amount2 +
        expense.tax_amount3
      );
    }

    let finalAmount = expense.amount;

    if (expense.tax_name1) {
      finalAmount += expense.amount * (expense.tax_rate1 / 100);
    }

    if (expense.tax_name2) {
      finalAmount += expense.amount * (expense.tax_rate2 / 100);
    }

    if (expense.tax_name3) {
      finalAmount += expense.amount * (expense.tax_rate3 / 100);
    }

    return finalAmount;
  };
}

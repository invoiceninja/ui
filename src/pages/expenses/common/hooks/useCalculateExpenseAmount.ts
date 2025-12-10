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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';

export function useCalculateExpenseAmount() {
  const company = useCurrentCompany();
  const resolveCurrency = useResolveCurrency();

  const roundToPrecision = (number: number, precision: number) => {
    const isNegative = number < 0;
    if (isNegative) {
      number = number * -1;
    }

    number = Number(Math.round(Number(number + `e+${precision}`)) + `e-${precision}`);

    if (isNegative) {
      number = number * -1;
    }

    return number;
  };

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

    const currencyId = expense.currency_id || company?.settings.currency_id;
    const currency = resolveCurrency(currencyId);
    const precision = currency?.precision || 2;

    let finalAmount = expense.amount;

    if (expense.tax_name1) {
      const taxAmount = expense.amount * (expense.tax_rate1 / 100);
      finalAmount += roundToPrecision(taxAmount, precision);
    }

    if (expense.tax_name2) {
      const taxAmount = expense.amount * (expense.tax_rate2 / 100);
      finalAmount += roundToPrecision(taxAmount, precision);
    }

    if (expense.tax_name3) {
      const taxAmount = expense.amount * (expense.tax_rate3 / 100);
      finalAmount += roundToPrecision(taxAmount, precision);
    }

    return finalAmount;
  };
}

export function useCalculateExpenseExclusiveAmount() {
  const company = useCurrentCompany();
  const resolveCurrency = useResolveCurrency();

  const roundToPrecision = (number: number, precision: number) => {
    const isNegative = number < 0;
    if (isNegative) {
      number = number * -1;
    }

    number = Number(Math.round(Number(number + `e+${precision}`)) + `e-${precision}`);

    if (isNegative) {
      number = number * -1;
    }

    return number;
  };

  return (expense: Expense | RecurringExpense) => {
    if (!expense.uses_inclusive_taxes) {
      return expense.amount;
    }

    if (expense.calculate_tax_by_amount) {
      return (
        expense.amount -
        expense.tax_amount1 -
        expense.tax_amount2 -
        expense.tax_amount3
      );
    }

    const currencyId = expense.currency_id || company?.settings.currency_id;
    const currency = resolveCurrency(currencyId);
    const precision = currency?.precision || 2;

    let exclusiveAmount = expense.amount;

    if (expense.tax_rate1 > 0 || expense.tax_rate1 < 0) {
      exclusiveAmount = roundToPrecision(
        exclusiveAmount / (1 + expense.tax_rate1 / 100),
        precision
      );
    }

    if (expense.tax_rate2 > 0 || expense.tax_rate2 < 0) {
      exclusiveAmount = roundToPrecision(
        exclusiveAmount / (1 + expense.tax_rate2 / 100),
        precision
      );
    }

    if (expense.tax_rate3 > 0 || expense.tax_rate3 < 0) {
      exclusiveAmount = roundToPrecision(
        exclusiveAmount / (1 + expense.tax_rate3 / 100),
        precision
      );
    }

    return exclusiveAmount;
  };
}

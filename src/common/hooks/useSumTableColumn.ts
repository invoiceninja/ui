/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import collect from 'collect.js';
import { Invoice } from '../interfaces/invoice';
import { useFormatMoney } from './money/useFormatMoney';
import { Client } from '../interfaces/client';
import { RecurringInvoice } from '../interfaces/recurring-invoice';
import { Payment } from '../interfaces/payment';
import { PurchaseOrder } from '../interfaces/purchase-order';
import { Expense } from '../interfaces/expense';
import { RecurringExpense } from '../interfaces/recurring-expense';
import { Transaction } from '../interfaces/transactions';
import { useCurrentCompany } from './useCurrentCompany';
import { useUserNumberPrecision } from './useUserNumberPrecision';

type Resource =
  | Invoice
  | Client
  | RecurringInvoice
  | Payment
  | PurchaseOrder
  | Expense
  | RecurringExpense
  | Transaction;

interface Params {
  currencyPath?: string;
  countryPath?: string;
}
export function useSumTableColumn(params?: Params) {
  const formatMoney = useFormatMoney();

  const company = useCurrentCompany();

  const numberPrecision = useUserNumberPrecision();

  const { currencyPath, countryPath } = params || {};

  return (values: number[] | undefined, resources: Resource[] | undefined) => {
    if (values && resources) {
      const result = values.reduce(
        (total, currentValue) => total + Number(currentValue || 0),
        0
      );

      const countryIds = collect(resources)
        .pluck(countryPath || 'client.country_id')
        .unique()
        .toArray() as string[];

      const currencyIds = collect(resources)
        .pluck(currencyPath || 'client.settings.currency_id')
        .map((currencyId) =>
          typeof currencyId === 'string' && currencyId
            ? currencyId
            : company?.settings.currency_id
        )
        .unique()
        .toArray() as (string | undefined)[];

      if (currencyIds.length > 1) {
        return Number(result.toFixed(numberPrecision));
      }

      return formatMoney(
        result,
        countryIds.length === 1 && typeof countryIds[0] === 'string'
          ? countryIds[0]
          : undefined,
        currencyIds[0],
        numberPrecision
      );
    }

    return '-/-';
  };
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '../interfaces/client';
import { Credit } from '../interfaces/credit';
import { Expense } from '../interfaces/expense';
import { Invoice } from '../interfaces/invoice';
import { Payment } from '../interfaces/payment';
import { Product } from '../interfaces/product';
import { Project } from '../interfaces/project';
import { Quote } from '../interfaces/quote';
import { RecurringExpense } from '../interfaces/recurring-expense';
import { RecurringInvoice } from '../interfaces/recurring-invoice';
import { Task } from '../interfaces/task';
import { Vendor } from '../interfaces/vendor';
import { useCurrentUser } from './useCurrentUser';

type Entity =
  | Client
  | Invoice
  | Quote
  | Payment
  | RecurringInvoice
  | Credit
  | Project
  | Task
  | Expense
  | Vendor
  | RecurringExpense
  | Product;

export function useEntityAssigned() {
  const user = useCurrentUser();

  return (entity: Entity | undefined) => {
    if (
      user &&
      entity &&
      (entity.user_id === user.id || entity.assigned_user_id === user.id)
    ) {
      return true;
    }

    return false;
  };
}

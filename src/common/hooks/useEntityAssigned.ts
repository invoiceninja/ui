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
import { PurchaseOrder } from '../interfaces/purchase-order';
import { Quote } from '../interfaces/quote';
import { RecurringExpense } from '../interfaces/recurring-expense';
import { RecurringInvoice } from '../interfaces/recurring-invoice';
import { Task } from '../interfaces/task';
import { Transaction } from '../interfaces/transactions';
import { Vendor } from '../interfaces/vendor';
import { useAdmin } from './permissions/useHasPermission';
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
  | Product
  | PurchaseOrder
  | Transaction;

export function useEntityAssigned() {
  const user = useCurrentUser();
  const { isAdmin, isOwner } = useAdmin();

  return (entity: Entity | undefined | null, creationOnly?: boolean) => {
    if (creationOnly) {
      return (
        Boolean(user && entity && entity.user_id === user.id) ||
        isAdmin ||
        isOwner
      );
    }

    const isEntityAssigned =
      user &&
      entity &&
      'assigned_user_id' in entity &&
      entity.assigned_user_id === user.id;

    return Boolean(
      user &&
        entity &&
        (entity.user_id === user.id || isEntityAssigned || isAdmin || isOwner)
    );
  };
}

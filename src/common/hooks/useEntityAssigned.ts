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
import { Invoice } from '../interfaces/invoice';
import { Payment } from '../interfaces/payment';
import { Quote } from '../interfaces/quote';
import { RecurringInvoice } from '../interfaces/recurring-invoice';
import { useCurrentUser } from './useCurrentUser';

type Entity = Client | Invoice | Quote | Payment | RecurringInvoice;

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

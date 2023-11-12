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
import { useHasPermission } from './permissions/useHasPermission';
import { useEntityAssigned } from './useEntityAssigned';

type Entity = 'client' | 'recurring_invoice' | 'payment' | 'invoice' | 'quote';
type Resource = Client | RecurringInvoice | Payment | Invoice | Quote;

export function useDisableNavigation() {
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  return (entity: Entity, resource: Resource | undefined) => {
    return (
      !hasPermission(`view_${entity}`) &&
      !hasPermission(`edit_${entity}`) &&
      !entityAssigned(resource)
    );
  };
}

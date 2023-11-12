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
import { RecurringInvoice } from '../interfaces/recurring-invoice';
import { useHasPermission } from './permissions/useHasPermission';
import { useEntityAssigned } from './useEntityAssigned';

type Entity = 'client' | 'recurring_invoice';
type EntityType = Client | RecurringInvoice;

interface Resource {
  entity: Entity;
  value: EntityType | undefined;
}

export function useDisableNavigation() {
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  return (resource: Resource) => {
    return (
      !hasPermission(`view_${resource.entity}`) &&
      !hasPermission(`edit_${resource.entity}`) &&
      (!entityAssigned(resource.value) ||
        !hasPermission(`create_${resource.entity}`))
    );
  };
}

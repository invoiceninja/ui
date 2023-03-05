/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEntityCustomFields } from 'common/hooks/useEntityCustomFields';

export function useAllClientColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'client',
    });

  const clientColumns = [
    'number',
    'name',
    'balance',
    'paid_to_date',
    'contact_name',
    'contact_email',
    'last_login_at',
    'address2',
    'archived_at',
    //   'assigned_to',
    'contact_phone',
    'contacts',
    'country',
    'created_at',
    //   'created_by',
    'credit_balance',
    'currency',
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'documents',
    'entity_state',
    //   'group',
    'id_number',
    'is_deleted',
    'language',
    'phone',
    'private_notes',
    'public_notes',
    'state',
    'address1',
    'task_rate',
    'updated_at',
    'vat_number',
    'website',
  ] as const;

  return clientColumns;
}

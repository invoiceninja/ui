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

export function useAllPaymentColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'payment',
    });

  const paymentColumns = [
    'status',
    'number',
    'client',
    'amount',
    'invoice_number',
    'date',
    'type',
    'transaction_reference',
    'archived_at',
    //   'assigned_to', @Todo: Need to resolve relationship
    'converted_amount', // @Todo: How's this different to `amount`?
    'created_at',
    //   'created_by', @Todo: Need to resolve relationship
    //   'credit_number', @Todo: Need to resolve relationship
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'entity_state',
    'exchange_rate',
    //   'gateway', @Todo: Need to resolve relationship
    'is_deleted',
    'private_notes',
    'refunded',
    'updated_at',
  ] as const;

  return paymentColumns;
}

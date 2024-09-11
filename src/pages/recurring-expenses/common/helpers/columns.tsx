/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function getEditPageLinkColumnOptions() {
  return {
    mainEditPageLinkColumns: ['number', 'status'],
    editPageLinkColumnOptions: [
      'date',
      'amount',
      'public_notes',
      'exchange_rate',
      'payment_date',
      'private_notes',
      'should_be_invoiced',
      'next_send_date',
    ],
  };
}

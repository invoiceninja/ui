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
    mainEditPageLinkColumns: ['number'],
    editPageLinkColumnOptions: [
      'description',
      'number',
      'time_log',
      'entity_state',
      'calculated_rate',
      'is_running',
      'rate',
    ],
  };
}

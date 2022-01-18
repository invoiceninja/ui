/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export enum PaymentStatus {
  PartiallyUnapplied = '-2',
  Unapplied = '-1',
  Pending = '1',
  Cancelled = '2',
  Failed = '3',
  Completed = '4',
  PartiallyRefunded = '5',
  Refunded = '6',
}

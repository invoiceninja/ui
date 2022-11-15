/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const enum TransactionType {
  Deposit = '1',
  Withdrawal = '2',
}

export const enum TransactionStatus {
  Unmatched = '1',
  Matched = '2',
  Converted = '3',
}

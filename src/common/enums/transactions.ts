/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const enum TransactionType {
  Deposit = 'deposit',
  Withdrawal = 'withdrawal',
}

export const enum ApiTransactionType {
  Credit = 'CREDIT',
  Debit = 'DEBIT',
}

export const enum TransactionStatus {
  Unmatched = '1',
  Matched = '2',
  Converted = '3',
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TransactionStatus, TransactionType } from '$app/common/enums/transactions';

export const transactionTypes = {
  [TransactionType.Deposit]: 'deposit',
  [TransactionType.Withdrawal]: 'withdrawal',
};

export const transactionStatuses = {
  [TransactionStatus.Unmatched]: 'unmatched',
  [TransactionStatus.Matched]: 'matched',
  [TransactionStatus.Converted]: 'converted',
};

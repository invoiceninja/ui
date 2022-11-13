/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  TransactionInput,
  TransactionStatus,
} from 'common/interfaces/transactions';

export const transactionTypes = [
  {
    id: '1',
    key: 'deposit',
  },
  {
    id: '2',
    key: 'withdrawal',
  },
];

export const defaultTransactionProperties: TransactionInput = {
  base_type: 'deposit',
  date: '',
  amount: 0,
  currency_id: '',
  bank_integration_id: '',
  description: '',
};

export const transactionStatuses: TransactionStatus[] = [
  {
    id: '1',
    key: 'unmatched',
  },
  {
    id: '2',
    key: 'matched',
  },
  {
    id: '3',
    key: 'converted',
  },
];

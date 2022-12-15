/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { BankAccount } from 'common/interfaces/bank-accounts';
import { DataTableColumns } from 'components/DataTable';
import { useTranslation } from 'react-i18next';

export const useSubscriptionColumns = () => {
  const [t] = useTranslation();

  const columns: DataTableColumns<BankAccount> = [
    {
      id: 'category',
      label: t('category'),
    },
    { id: 'total', label: t('total') },
  ];

  return columns;
};

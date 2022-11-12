/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { BankAccount } from 'common/interfaces/bank-accounts';
import { DataTableColumns } from 'components/DataTable';
import { useTranslation } from 'react-i18next';

export const useBankAccountColumns = () => {
  const { t } = useTranslation();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  const columns: DataTableColumns<BankAccount> = [
    {
      id: 'bank_account_name',
      label: 'Bank account name',
      format: (field, resource) => (
        <Link
          to={route('/settings/bank_accounts/:id/details', {
            id: resource?.id,
          })}
        >
          {resource?.bank_account_name}
        </Link>
      ),
    },
    { id: 'bank_account_type', label: 'Bank account type' },
    {
      id: 'balance',
      label: t('balance'),
      format: (value) =>
        formatMoney(
          value,
          company?.settings?.country_id,
          company?.settings?.currency_id
        ),
    },
  ];

  return columns;
};

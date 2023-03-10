/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { BankAccount } from '$app/common/interfaces/bank-accounts';
import { DataTableColumns } from '$app/components/DataTable';
import { useTranslation } from 'react-i18next';

export const useBankAccountColumns = () => {
  const { t } = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const columns: DataTableColumns<BankAccount> = [
    {
      id: 'bank_account_name',
      label: t('name'),
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
    { id: 'bank_account_type', label: t('type') },
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

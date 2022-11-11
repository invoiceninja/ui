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
import { useTitle } from 'common/hooks/useTitle';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { route } from 'common/helpers/route';
import { BankAccount } from 'common/interfaces/bank-accounts';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { ConnectAccounts } from '../components';
import { isHosted } from 'common/helpers';

const BankAccounts = () => {
  useTitle('bank_accounts');
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
  ];

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

  return (
    <Settings
      title={t('bank_accounts')}
      breadcrumbs={pages}
      docsLink="/docs/advanced-settings/#bank_accounts"
    >
      <DataTable
        resource="bank_account"
        columns={columns}
        endpoint="/api/v1/bank_integrations"
        linkToCreate="/settings/bank_accounts/create"
        linkToEdit="/settings/bank_accounts/:id/edit"
        withResourcefulActions
        rightSide={isHosted() && <ConnectAccounts />}
      />
    </Settings>
  );
};

export default BankAccounts;

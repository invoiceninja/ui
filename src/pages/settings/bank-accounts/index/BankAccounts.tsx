/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { DataTable } from 'components/DataTable';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { ConnectAccounts } from '../components';
import { isHosted } from 'common/helpers';
import { useBankAccountColumns } from '../common/hooks/useBankAccountColumns';
import { useBankAccountPages } from '../common/hooks/useBankAccountPages';

const BankAccounts = () => {
  useTitle('bank_accounts');
  const [t] = useTranslation();
  const pages = useBankAccountPages();
  const columns = useBankAccountColumns();

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

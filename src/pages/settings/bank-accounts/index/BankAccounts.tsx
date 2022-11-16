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
import { useBankAccountColumns } from '../common/hooks/useBankAccountColumns';
import { Button } from '@invoiceninja/forms';
import { MdLink } from 'react-icons/md';
import { endpoint, isHosted } from 'common/helpers';
import { request } from 'common/helpers/request';

export function BankAccounts() {
  useTitle('bank_accounts');

  const [t] = useTranslation();

  const columns = useBankAccountColumns();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
  ];

  const handleConnectAccounts = async () => {
    const tokenResponse = await request(
      'POST',
      endpoint('/api/v1/one_time_token'),
      { context: 'yodlee', platform: 'react' },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-SECRET': 'password',
        },
      }
    );
    window.open(`/yodlee/onboard/${tokenResponse?.data?.hash}`);
  };

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
        rightSide={
          isHosted() && (
            <Button onClick={handleConnectAccounts}>
              <span className="mr-2">{<MdLink />}</span>
              {t('connect_accounts')}
            </Button>
          )
        }
      />
    </Settings>
  );
}

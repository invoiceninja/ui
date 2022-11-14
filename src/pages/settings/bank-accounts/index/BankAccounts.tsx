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
import { isHosted } from 'common/helpers';
import { useBankAccountColumns } from '../common/hooks/useBankAccountColumns';
import { Button } from '@invoiceninja/forms';
import { MdLink } from 'react-icons/md';

export function BankAccounts() {
  useTitle('bank_accounts');

  const [t] = useTranslation();

  const columns = useBankAccountColumns();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
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
        rightSide={
          isHosted() && (
            <Button>
              <span className="mr-2">{<MdLink />}</span>
              {t('connect_accounts')}
            </Button>
          )
        }
      />
    </Settings>
  );
}

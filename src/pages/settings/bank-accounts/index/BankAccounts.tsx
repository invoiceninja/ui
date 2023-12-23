/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable } from '$app/components/DataTable';
import { Settings } from '$app/components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { useBankAccountColumns } from '../common/hooks/useBankAccountColumns';
import { Button } from '$app/components/forms';
import { MdRefresh, MdRuleFolder } from 'react-icons/md';
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { useNavigate } from 'react-router-dom';
import { toast } from '$app/common/helpers/toast/toast';
import { Icon } from '$app/components/icons/Icon';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { ConnectAccounts } from '../common/components/ConnectAccounts';

export function BankAccounts() {
  useTitle('bank_accounts');

  const [t] = useTranslation();

  const columns = useBankAccountColumns();

  const navigate = useNavigate();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
  ];

  const handleRefresh = () => {
    request(
      'POST',
      endpoint('/api/v1/bank_integrations/refresh_accounts'),
      {}
    ).then((response) => {
      toast.success(response.data.message);
    });
  };

  return (
    <Settings
      title={t('bank_accounts')}
      breadcrumbs={pages}
      docsLink="/docs/advanced-settings/#bank_accounts"
      withoutBackButton
    >
      {!enterprisePlan() && isHosted() && (
        <AdvancedSettingsPlanAlert
          message={t('upgrade_to_connect_bank_account') as string}
        />
      )}

      <DataTable
        resource="bank_account"
        columns={columns}
        endpoint="/api/v1/bank_integrations?sort=id|desc"
        bulkRoute="/api/v1/bank_integrations/bulk"
        linkToCreate="/settings/bank_accounts/create"
        linkToEdit="/settings/bank_accounts/:id/edit"
        withResourcefulActions
        rightSide={
          <div className="flex space-x-2">
            <ConnectAccounts />

            {isHosted() && enterprisePlan() && (
              <Button type="secondary" onClick={handleRefresh}>
                <span className="mr-2">
                  {<Icon element={MdRefresh} size={20} />}
                </span>
                {t('refresh')}
              </Button>
            )}

            {((isHosted() && (proPlan() || enterprisePlan())) ||
              isSelfHosted()) && (
              <Button
                type="secondary"
                onClick={() =>
                  navigate('/settings/bank_accounts/transaction_rules')
                }
              >
                <span className="mr-2">
                  {<Icon element={MdRuleFolder} size={20} />}
                </span>
                {t('rules')}
              </Button>
            )}
          </div>
        }
      />
    </Settings>
  );
}

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
import { MdLink, MdRuleFolder } from 'react-icons/md';
import { endpoint, isHosted } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { enterprisePlan } from 'common/guards/guards/enterprise-plan';
import { AdvancedSettingsPlanAlert } from 'components/AdvancedSettingsPlanAlert';
import { useNavigate } from 'react-router-dom';
import { proPlan } from 'common/guards/guards/pro-plan';

export function BankAccounts() {
  useTitle('bank_accounts');

  const [t] = useTranslation();

  const columns = useBankAccountColumns();

  const navigate = useNavigate();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
  ];

  const handleConnectAccounts = async () => {
    const tokenResponse = await request(
      'POST',
      endpoint('/api/v1/one_time_token'),
      { context: 'yodlee', platform: 'react' }
    );
    window.open(
      route('https://invoicing.co/yodlee/onboard/:hash', {
        hash: tokenResponse?.data?.hash,
      })
    );
  };

  return (
    <Settings
      title={t('bank_accounts')}
      breadcrumbs={pages}
      docsLink="/docs/advanced-settings/#bank_accounts"
    >
      {!enterprisePlan() && isHosted() && (
        <AdvancedSettingsPlanAlert
          message={t('upgrade_to_connect_bank_account') as string}
        />
      )}

      <DataTable
        resource="bank_account"
        columns={columns}
        endpoint="/api/v1/bank_integrations"
        linkToCreate="/settings/bank_accounts/create"
        linkToEdit="/settings/bank_accounts/:id/edit"
        withResourcefulActions
        rightSide={
          <div className="flex space-x-2">
            {isHosted() && enterprisePlan() && (
              <Button onClick={handleConnectAccounts}>
                <span className="mr-2">{<MdLink fontSize={20} />}</span>
                {t('connect_accounts')}
              </Button>
            )}

            {isHosted() && (proPlan() || enterprisePlan()) && (
              <Button
                onClick={() =>
                  navigate('/settings/bank_accounts/transaction_rules')
                }
              >
                <span className="mr-2">{<MdRuleFolder fontSize={20} />}</span>
                {t('rules')}
              </Button>
            )}
          </div>
        }
      />
    </Settings>
  );
}

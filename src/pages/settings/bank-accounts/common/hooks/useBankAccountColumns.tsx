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
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { MdWarning } from 'react-icons/md';
import { Tooltip } from '$app/components/Tooltip';

enum IntegrationType {
  Yodlee = 'YODLEE',
  Nordigen = 'NORDIGEN',
}
export const useBankAccountColumns = () => {
  const { t } = useTranslation();
  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();
  const resolveCurrency = useResolveCurrency({ resolveBy: 'code' });

  const handleConnectNordigen = () => {
    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'nordigen',
      platform: 'react',
    }).then((tokenResponse) => {
      window.open(
        endpoint('/nordigen/connect/:hash', {
          hash: tokenResponse?.data?.hash,
        })
      );
    });
  };

  const columns: DataTableColumns<BankAccount> = [
    {
      id: 'bank_account_name',
      label: t('name'),
      format: (field, bankAccount) => (
        <div className="flex items-center space-x-3">
          <Link
            to={route('/settings/bank_accounts/:id/details', {
              id: bankAccount?.id,
            })}
          >
            {bankAccount?.bank_account_name}
          </Link>

          {bankAccount.integration_type === IntegrationType.Nordigen &&
            bankAccount.disabled_upstream && (
              <Tooltip
                message={t('reconnect_account') as string}
                width="auto"
                placement="top"
              >
                <MdWarning
                  color="red"
                  size={22}
                  onClick={handleConnectNordigen}
                />
              </Tooltip>
            )}
        </div>
      ),
    },
    { id: 'bank_account_type', label: t('type') },
    {
      id: 'balance',
      label: t('balance'),
      format: (value, bankAccount) =>
        formatMoney(
          value,
          company?.settings?.country_id,
          resolveCurrency(bankAccount.currency)?.id
        ),
    },
  ];

  return columns;
};

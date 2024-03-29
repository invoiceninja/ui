/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { BankAccount } from '$app/common/interfaces/bank-accounts';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';

interface Props {
  accountDetails?: BankAccount;
}

export function Details(props: Props) {
  const {
    balance,
    bank_account_type: bankAccountType,
    provider_name: providerName,
    bank_account_status: bankAccountStatus,
    currency = '',
  } = props?.accountDetails || {};

  const [t] = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();
  const resolveCurrency = useResolveCurrency({ resolveBy: 'code' });

  return (
    <Card title={t('details')}>
      <Element leftSide={t('balance')}>
        {formatMoney(
          balance || 0,
          company.settings.country_id,
          resolveCurrency(currency)?.id
        )}
      </Element>
      <Element leftSide={t('type')}>{bankAccountType}</Element>
      <Element leftSide={t('provider')}>{providerName}</Element>
      <Element leftSide={t('status')}>{bankAccountStatus}</Element>
    </Card>
  );
}

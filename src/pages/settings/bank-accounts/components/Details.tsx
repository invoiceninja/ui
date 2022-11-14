/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { BankAccountDetails } from 'common/interfaces/bank-accounts';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';

interface Props {
  accountDetails?: BankAccountDetails;
}

export function Details(props: Props) {
  const {
    balance,
    bank_account_type: bankAccountType,
    provider_name: providerName,
    bank_account_status: bankAccountStatus,
  } = props?.accountDetails || {};

  const [t] = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  return (
    <Card title={t('details')}>
      <Element leftSide={t('balance')}>
        {formatMoney(
          balance || 0,
          company.settings.country_id,
          company.settings.currency_id
        )}
      </Element>
      <Element leftSide={t('type')}>{bankAccountType}</Element>
      <Element leftSide={t('provider')}>{providerName}</Element>
      <Element leftSide={t('status')}>{bankAccountStatus}</Element>
    </Card>
  );
}

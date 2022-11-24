/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { ApiTransactionType, TransactionType } from 'common/enums/transactions';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { TransactionDetails } from 'common/interfaces/transactions';
import { useTranslation } from 'react-i18next';
import TransactionMatchDetails from './TransactionMatchDetails';

interface Props {
  transactionDetails?: TransactionDetails;
}

export function Details(props: Props) {
  const {
    amount = 0,
    date,
    currency_id = '',
    base_type = '',
  } = props.transactionDetails || {};

  const [t] = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  return (
    <Card title={t('details')}>
      <Element leftSide={t('type')}>
        {base_type === ApiTransactionType.Credit
          ? t(TransactionType.Deposit)
          : t(TransactionType.Withdrawal)}
      </Element>
      <Element leftSide={t('amount')}>
        {formatMoney(amount, company?.settings?.country_id, currency_id)}
      </Element>
      <Element leftSide={t('date')}>{date}</Element>
      <TransactionMatchDetails base_type={base_type} />
    </Card>
  );
}

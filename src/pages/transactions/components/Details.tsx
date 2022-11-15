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
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { TransactionDetails } from 'common/interfaces/transactions';
import { useTranslation } from 'react-i18next';

interface Props {
  transactionDetails?: TransactionDetails;
}

export function Details(props: Props) {
  const { amount = 0, date, currency_id = '' } = props.transactionDetails || {};

  const [t] = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  return (
    <Card title={t('details')}>
      <Element leftSide={t('amount')}>
        {formatMoney(amount, company?.settings?.country_id, currency_id)}
      </Element>
      <Element leftSide={t('date')}>{date}</Element>
    </Card>
  );
}

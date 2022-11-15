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
import { useCountries } from 'common/hooks/useCountries';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { TransactionDetails } from 'common/interfaces/transactions';
import { useTranslation } from 'react-i18next';

interface Props {
  transactionDetails?: TransactionDetails;
}

export function Details(props: Props) {
  const { amount = 0, date, currency_id = '' } = props.transactionDetails || {};

  const [t] = useTranslation();

  const countries = useCountries();

  const formatMoney = useFormatMoney();

  const resolveCurrency = useResolveCurrency();

  const getCountryIdByCurrencyCode = (currencyCode: string) => {
    return (
      countries?.find(({ currency_code: code }) => code === currencyCode)?.id ||
      ''
    );
  };

  const countryId = getCountryIdByCurrencyCode(
    resolveCurrency(currency_id)?.code || ''
  );

  return (
    <Card title={t('details')}>
      <Element leftSide={t('amount')}>
        {formatMoney(amount, countryId, currency_id)}
      </Element>
      <Element leftSide={t('date')}>{date}</Element>
    </Card>
  );
}

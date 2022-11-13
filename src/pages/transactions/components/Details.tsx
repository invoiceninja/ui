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
import { useCurrencies } from 'common/hooks/useCurrencies';
import { TransactionDetails } from 'common/interfaces/transactions';
import { useTranslation } from 'react-i18next';

const Details = ({
  transactionDetails,
}: {
  transactionDetails: TransactionDetails | undefined;
}) => {
  const { amount = 0, date, currency_id = '' } = transactionDetails || {};

  const [t] = useTranslation();
  const countries = useCountries();
  const currencies = useCurrencies();
  const formatMoney = useFormatMoney();

  const getCurrencyCodeById = (): string => {
    return currencies?.find(({ id }) => currency_id === id)?.code || '';
  };

  const getCountryIdByCurrencyCode = (
    currencyCode: string | undefined
  ): string => {
    return (
      countries?.find(({ currency_code: code }) => code === currencyCode)?.id ||
      ''
    );
  };

  const countryId = getCountryIdByCurrencyCode(getCurrencyCodeById());

  return (
    <Card title={t('details')}>
      <Element leftSide={t('amount')}>
        {formatMoney(amount, countryId, currency_id)}
      </Element>
      <Element leftSide={t('date')}>{date}</Element>
    </Card>
  );
};

export default Details;

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from 'common/queries/statics';
import { getExchangeRate } from 'pages/payments/common/helpers/resolve-exchange-rate';
import { useTranslation } from 'react-i18next';
import { Element } from './cards';
import { InputField, SelectField } from './forms';

interface Props {
  amount: number;
  exchangeRate: string;
  exchangeCurrencyId: string;
  currencyId: string;
  onChange: (exchangeRate: number, exchangeCurrencyId: string) => unknown;
  onExchangeRateChange: (value: number) => unknown;
}

export function ConvertCurrency(props: Props) {
  const { data: statics } = useStaticsQuery();
  const [t] = useTranslation();

  const handleChange = (value: string) => {
    return props.onChange(
      getExchangeRate(props.currencyId, value, statics),
      value
    );
  };

  return (
    <>
      <Element leftSide={t('currency')}>
        <SelectField
          withBlank
          value={props.exchangeCurrencyId}
          onValueChange={handleChange}
        >
          {statics?.data.currencies.map((element: any, index: any) => (
            <option value={element.id} key={index}>
              {element.name}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('exchange_rate')}>
        <InputField
          onValueChange={(value) =>
            props.onExchangeRateChange(parseFloat(value))
          }
          value={props.exchangeRate}
        />
      </Element>

      <Element leftSide={t('converted_amount')}>
        <InputField value={props.amount * parseFloat(props.exchangeRate)} />
      </Element>
    </>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { Checkbox, Radio, SelectField } from '../../../../components/forms';

export function Settings() {
  const [t] = useTranslation();

  const currencyFormats = [
    { id: 'symbol', title: 'Symbol: $1,000.00' },
    { id: 'code', title: 'Code: 1,000.00 USD' },
  ];

  return (
    <>
      <Card title={t('settings')}>
        <Element leftSide={t('currency')}>
          <SelectField>
            <option>US Dollar</option>
          </SelectField>
        </Element>
        <Element leftSide={t('currency_format')}>
          <Radio options={currencyFormats} defaultSelected="code" />
        </Element>
        <Element leftSide={t('language')}>
          <SelectField>
            <option>English</option>
          </SelectField>
        </Element>
        <Element leftSide={t('timezone')}>
          <SelectField>
            <option>Europe/Sarajevo</option>
          </SelectField>
        </Element>
        <Element leftSide={t('date_format')}>
          <SelectField>
            <option>January 31, 2000</option>
          </SelectField>
        </Element>
        <Element leftSide={t('military_time')}>
          <Checkbox />
        </Element>
        <Element leftSide={t('decimal_comma')}>
          <Checkbox />
        </Element>
      </Card>

      <Card>
        <Element leftSide={t('first_month_of_the_year')}>
          <SelectField>
            <option>January</option>
          </SelectField>
        </Element>
      </Card>
    </>
  );
}

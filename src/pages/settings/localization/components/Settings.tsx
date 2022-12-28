/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isDemo } from 'common/helpers';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { DateFormat } from 'common/interfaces/date-format';
import { Language } from 'common/interfaces/language';
import { Timezone } from 'common/interfaces/timezone';
import { useStaticsQuery } from 'common/queries/statics';
import { updateChanges } from 'common/stores/slices/company-users';
import { Divider } from 'components/cards/Divider';
import dayjs from 'dayjs';
import { useHandleCurrentCompanyChange } from 'pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { Radio, SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';

export function Settings() {
  const [t] = useTranslation();
  const { data: statics } = useStaticsQuery();

  const dispatch = useDispatch();
  const company = useInjectCompanyChanges();

  const handleChange = useHandleCurrentCompanyChange();

  const currencyFormats = [
    {
      id: 'symbol',
      title: `${t('currency_symbol')}: $1,000.00`,
      value: 'false',
    },
    { id: 'code', title: `${t('currency_code')}: 1,000.00 USD`, value: 'true' },
  ];

  return (
    <>
      <Card title={t('settings')}>
        <Element leftSide={t('currency')}>
          <SelectField
            value={company?.settings?.currency_id || ''}
            id="settings.currency_id"
            onChange={handleChange}
          >
            <option value=""></option>
            {statics?.currencies.map((currency) => (
              <option value={currency.id} key={currency.id}>
                {currency.name}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element leftSide={t('decimal_comma')}>
          <Toggle
            checked={company?.settings.use_comma_as_decimal_place}
            onChange={(value: boolean) =>
              dispatch(
                updateChanges({
                  object: 'company',
                  property: 'use_comma_as_decimal_place',
                  value,
                })
              )
            }
          />
        </Element>

        <Element leftSide={t('currency_format')}>
          <Radio
            onValueChange={(value) =>
              dispatch(
                updateChanges({
                  object: 'company',
                  property: 'settings.show_currency_code',
                  value: value === 'true' ? true : false,
                })
              )
            }
            name="show_currency_code"
            options={currencyFormats}
            defaultSelected={company?.settings?.show_currency_code.toString()}
          />
        </Element>

        {!isDemo() && (
          <Element leftSide={t('language')}>
            <SelectField
              onChange={handleChange}
              id="settings.language_id"
              value={company?.settings?.language_id || '1'}
            >
              {statics?.languages.map((language: Language) => (
                <option value={language.id} key={language.id}>
                  {language.name}
                </option>
              ))}
            </SelectField>
          </Element>
        )}

        <Element leftSide={t('timezone')}>
          <SelectField
            onChange={handleChange}
            id="settings.timezone_id"
            value={company?.settings?.timezone_id || '1'}
          >
            {statics?.timezones.map((timezone: Timezone) => (
              <option value={timezone.id} key={timezone.id}>
                {timezone.name}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element leftSide={t('date_format')}>
          <SelectField
            onChange={handleChange}
            id="settings.date_format_id"
            value={company?.settings?.date_format_id || '1'}
          >
            {statics?.date_formats.map((dateFormat: DateFormat) => (
              <option value={dateFormat.id} key={dateFormat.id}>
                {dayjs().format(dateFormat.format_moment)}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element leftSide={t('military_time')}>
          <Toggle
            checked={company?.settings?.military_time}
            onChange={(value: boolean) =>
              dispatch(
                updateChanges({
                  object: 'company',
                  property: 'settings.military_time',
                  value,
                })
              )
            }
          />
        </Element>

        <Divider />

        <Element leftSide={t('first_month_of_the_year')}>
          <SelectField
            id="settings.first_month_of_year"
            value={company?.settings?.first_month_of_year || ''}
            onChange={handleChange}
          >
            <option value="">{/*  */}</option>
            <option value="1">{t('january')}</option>
            <option value="2">{t('february')}</option>
            <option value="3">{t('march')}</option>
            <option value="4">{t('april')}</option>
            <option value="5">{t('may')}</option>
            <option value="6">{t('june')}</option>
            <option value="7">{t('july')}</option>
            <option value="8">{t('august')}</option>
            <option value="9">{t('september')}</option>
            <option value="10">{t('october')}</option>
            <option value="11">{t('november')}</option>
            <option value="12">{t('december')}</option>
          </SelectField>
        </Element>
      </Card>
    </>
  );
}

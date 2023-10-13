/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isDemo } from '$app/common/helpers';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { DateFormat } from '$app/common/interfaces/date-format';
import { Language } from '$app/common/interfaces/language';
import { Timezone } from '$app/common/interfaces/timezone';
import { useStaticsQuery } from '$app/common/queries/statics';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { Divider } from '$app/components/cards/Divider';
import dayjs from 'dayjs';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { Radio } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { useAtom, useAtomValue } from 'jotai';
import { hasLanguageChanged } from '../common/atoms';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { SearchableSelect } from '$app/components/SearchableSelect';

export function Settings() {
  const [t] = useTranslation();
  const { data: statics } = useStaticsQuery();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const dispatch = useDispatch();
  const company = useInjectCompanyChanges();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const handlePropertyChange = useHandleCurrentCompanyChangeProperty()

  const [, setHasLanguageIdChanged] = useAtom(hasLanguageChanged);

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
          <SearchableSelect
            value={company?.settings?.currency_id || ''}
            errorMessage={errors?.errors['settings.currency_id']}
            onValueChange={(v) => handlePropertyChange('settings.currency_id', v)}
          >
            <option value=""></option>
            {statics?.currencies.map((currency) => (
              <option value={currency.id} key={currency.id}>
                {currency.name}
              </option>
            ))}
          </SearchableSelect>
        </Element>

        {/* <Element leftSide={t('decimal_comma')}>
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
        </Element> */}

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
            defaultSelected={
              company?.settings?.show_currency_code?.toString() ?? 'false'
            }
          />
        </Element>

        {!isDemo() && (
          <Element leftSide={t('language')}>
            <SearchableSelect
              value={company?.settings?.language_id || '1'}
              errorMessage={errors?.errors['settings.language_id']}
              onValueChange={(v) => {
                setHasLanguageIdChanged(true);
                handlePropertyChange('settings.language_id', v);
              }}
            >
              {statics?.languages.map((language: Language) => (
                <option value={language.id} key={language.id}>
                  {language.name}
                </option>
              ))}
            </SearchableSelect>
          </Element>
        )}

        <Element leftSide={t('timezone')}>
          <SearchableSelect
            value={company?.settings?.timezone_id || '1'}
            errorMessage={errors?.errors['settings.timezone_id']}
            onValueChange={(v) => handlePropertyChange('settings.timezone_id', v)}
          >
            {statics?.timezones.map((timezone: Timezone) => (
              <option value={timezone.id} key={timezone.id}>
                {timezone.name}
              </option>
            ))}
          </SearchableSelect>
        </Element>

        <Element leftSide={t('date_format')}>
          <SearchableSelect
            value={company?.settings?.date_format_id || '1'}
            errorMessage={errors?.errors['settings.date_format_id']}
            onValueChange={(v) => handlePropertyChange('settings.date_format_id', v)}
          >
            {statics?.date_formats.map((dateFormat: DateFormat) => (
              <option value={dateFormat.id} key={dateFormat.id}>
                {dayjs().format(dateFormat.format_moment)}
              </option>
            ))}
          </SearchableSelect>
        </Element>

        <Element leftSide={t('military_time')}>
          <Toggle
            checked={Boolean(company?.settings?.military_time)}
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

        {isCompanySettingsActive && <Divider />}

        {isCompanySettingsActive && (
          <Element leftSide={t('first_month_of_the_year')}>
            <SearchableSelect
              value={company?.first_month_of_year || ''}
              errorMessage={errors?.errors['settings.first_month_of_year']}
              onValueChange={(v) => handlePropertyChange('first_month_of_year', v)}
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
            </SearchableSelect>
          </Element>
        )}
      </Card>
    </>
  );
}

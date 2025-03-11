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
import { Timezone } from '$app/common/interfaces/timezone';
import { useStaticsQuery } from '$app/common/queries/statics';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { Divider } from '$app/components/cards/Divider';
import dayjs from 'dayjs';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { Radio, SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { useAtomValue, useSetAtom } from 'jotai';
import { hasLanguageChanged } from '../common/atoms';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { LanguageSelector } from '$app/components/LanguageSelector';
import { SearchableSelect } from '$app/components/SearchableSelect';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';

export function Settings() {
  const [t] = useTranslation();

  const { data: statics } = useStaticsQuery();

  const company = useInjectCompanyChanges();
  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const dispatch = useDispatch();
  const formatMoney = useFormatMoney();
  const disableSettingsField = useDisableSettingsField();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const errors = useAtomValue(companySettingsErrorsAtom);
  const setHasLanguageIdChanged = useSetAtom(hasLanguageChanged);

  const currencyFormats = [
    {
      id: 'symbol',
      title: `${t('currency_symbol')}: ${formatMoney(
        1000,
        company?.settings.country_id,
        company?.settings.currency_id,
        2
      )}`,
      value: 'false',
    },
    {
      id: 'code',
      title: `${t('currency_code')}: ${formatMoney(
        1000,
        company?.settings.country_id,
        company?.settings.currency_id,
        2,
        true
      )}`,
      value: 'true',
    },
  ];

  return (
    <>
      <Card title={t('settings')}>
        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="currency_id"
              labelElement={<SettingsLabel label={t('currency')} />}
              defaultValue="1"
            />
          }
        >
          <CurrencySelector
            value={company?.settings.currency_id || ''}
            onChange={(v) => handleChange('settings.currency_id', v)}
            disabled={disableSettingsField('currency_id')}
            errorMessage={errors?.errors['settings.currency_id']}
          />
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

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="show_currency_code"
              labelElement={<SettingsLabel label={t('currency_format')} />}
              defaultValue="false"
            />
          }
        >
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
            disabled={disableSettingsField('show_currency_code')}
          />
        </Element>

        {!isDemo() && (
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="language_id"
                labelElement={<SettingsLabel label={t('language')} />}
                defaultValue="1"
              />
            }
          >
            <LanguageSelector
              onChange={(v) => {
                setHasLanguageIdChanged(true);
                handleChange('settings.language_id', v);
              }}
              value={company?.settings?.language_id || ''}
              disabled={disableSettingsField('language_id')}
              errorMessage={errors?.errors['settings.language_id']}
            />
          </Element>
        )}

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="timezone_id"
              labelElement={<SettingsLabel label={t('timezone')} />}
              defaultValue="1"
            />
          }
        >
          <SearchableSelect
            value={company?.settings?.timezone_id || '1'}
            disabled={disableSettingsField('timezone_id')}
            errorMessage={errors?.errors['settings.timezone_id']}
            onValueChange={(v) => handleChange('settings.timezone_id', v)}
          >
            {statics?.timezones
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((timezone: Timezone) => (
                <option value={timezone.id} key={timezone.id}>
                  {timezone.name}
                </option>
              ))}
          </SearchableSelect>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="date_format_id"
              labelElement={<SettingsLabel label={t('date_format')} />}
              defaultValue="1"
            />
          }
        >
          <SelectField
            value={company?.settings?.date_format_id || '1'}
            onValueChange={(value) =>
              handleChange('settings.date_format_id', value)
            }
            disabled={disableSettingsField('date_format_id')}
            errorMessage={errors?.errors['settings.date_format_id']}
            customSelector
            dismissable={false}
          >
            {statics?.date_formats.map((dateFormat: DateFormat) => (
              <option value={dateFormat.id} key={dateFormat.id}>
                {dayjs().format(dateFormat.format_moment)}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="military_time"
              labelElement={<SettingsLabel label={t('military_time')} />}
              defaultValue={false}
            />
          }
        >
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
            disabled={disableSettingsField('military_time')}
            cypressRef="militaryTimeToggle"
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="enable_rappen_rounding"
              labelElement={<SettingsLabel label={t('rappen_rounding')} />}
              defaultValue={false}
            />
          }
        >
          <Toggle
            checked={Boolean(company?.settings?.enable_rappen_rounding)}
            onChange={(value: boolean) =>
              dispatch(
                updateChanges({
                  object: 'company',
                  property: 'settings.enable_rappen_rounding',
                  value,
                })
              )
            }
            disabled={disableSettingsField('enable_rappen_rounding')}
          />
        </Element>

        {isCompanySettingsActive && (
          <Element
            leftSide={t('decimal_comma')}
            leftSideHelp={t('use_comma_as_decimal_place')}
          >
            <Toggle
              checked={Boolean(company?.use_comma_as_decimal_place)}
              onChange={(value: boolean) =>
                handleChange('use_comma_as_decimal_place', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && <Divider />}

        {isCompanySettingsActive && (
          <Element leftSide={t('first_month_of_the_year')}>
            <SelectField
              value={company?.first_month_of_year || '1'}
              onValueChange={(value) =>
                handleChange('first_month_of_year', value)
              }
              errorMessage={errors?.errors['settings.first_month_of_year']}
              customSelector
              dismissable={false}
            >
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
        )}
      </Card>
    </>
  );
}

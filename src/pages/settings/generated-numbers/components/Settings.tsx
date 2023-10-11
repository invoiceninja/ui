/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';

export const COUNTER_PADDINGS = [
  '1',
  '01',
  '001',
  '0001',
  '00001',
  '000001',
  '0000001',
  '00000001',
  '000000001',
  '0000000001',
];

export const RESECT_COUNTER_FREQUENCIES = [
  'never',
  'freq_daily',
  'freq_weekly',
  'freq_two_weeks',
  'freq_four_weeks',
  'freq_monthly',
  'freq_two_months',
  'freq_three_months',
  'freq_four_months',
  'freq_six_months',
  'freq_annually',
  'freq_two_years',
  'freq_three_years',
];

export function Settings() {
  const [t] = useTranslation();

  const disableSettingsField = useDisableSettingsField();

  const companyChanges = useInjectCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const errors = useAtomValue(companySettingsErrorsAtom);

  return (
    <Card title={t('settings')}>
      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="counter_padding"
            labelElement={<SettingsLabel label={t('number_padding')} />}
            defaultValue="1"
          />
        }
      >
        <SelectField
          id="settings.counter_padding"
          value={companyChanges?.settings?.counter_padding || '1'}
          onValueChange={(value) =>
            handleChange('settings.counter_padding', value)
          }
          disabled={disableSettingsField('counter_padding')}
          errorMessage={errors?.errors['settings.counter_padding']}
        >
          {COUNTER_PADDINGS.map((value, index) => (
            <option key={index} value={index + 1}>
              {value}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="counter_number_applied"
            labelElement={<SettingsLabel label={t('generate_number')} />}
            defaultValue="when_saved"
          />
        }
      >
        <SelectField
          id="settings.counter_number_applied"
          value={
            companyChanges?.settings?.counter_number_applied || 'when_saved'
          }
          onValueChange={(value) =>
            handleChange('settings.counter_number_applied', value)
          }
          disabled={disableSettingsField('counter_number_applied')}
          errorMessage={errors?.errors['settings.counter_number_applied']}
        >
          <option value="when_saved">{t('when_saved')}</option>
          <option value="when_sent">{t('when_sent')}</option>
        </SelectField>
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="recurring_number_prefix"
            labelElement={<SettingsLabel label={t('recurring_prefix')} />}
          />
        }
      >
        <InputField
          value={companyChanges?.settings?.recurring_number_prefix || ''}
          onValueChange={(value) =>
            handleChange('settings.recurring_number_prefix', value)
          }
          disabled={disableSettingsField('recurring_number_prefix')}
          errorMessage={errors?.errors['settings.recurring_number_prefix']}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="shared_invoice_quote_counter"
            labelElement={
              <SettingsLabel label={t('shared_invoice_quote_counter')} />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          onChange={(value: boolean) =>
            handleChange('settings.shared_invoice_quote_counter', value)
          }
          checked={Boolean(
            companyChanges?.settings?.shared_invoice_quote_counter
          )}
          disabled={disableSettingsField('shared_invoice_quote_counter')}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="shared_invoice_credit_counter"
            labelElement={
              <SettingsLabel label={t('shared_invoice_credit_counter')} />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          onChange={(value: boolean) =>
            handleChange('settings.shared_invoice_credit_counter', value)
          }
          checked={Boolean(
            companyChanges?.settings?.shared_invoice_credit_counter
          )}
          disabled={disableSettingsField('shared_invoice_credit_counter')}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="reset_counter_frequency_id"
            labelElement={<SettingsLabel label={t('reset_counter')} />}
            defaultValue="0"
          />
        }
      >
        <SelectField
          value={companyChanges?.settings?.reset_counter_frequency_id || '0'}
          onValueChange={(value) =>
            handleChange('settings.reset_counter_frequency_id', parseInt(value))
          }
          disabled={disableSettingsField('reset_counter_frequency_id')}
          errorMessage={errors?.errors['settings.reset_counter_frequency_id']}
        >
          {RESECT_COUNTER_FREQUENCIES.map((value, index) => (
            <option key={index} value={index}>
              {t(value)}
            </option>
          ))}
        </SelectField>
      </Element>

      {companyChanges?.settings &&
        companyChanges?.settings?.reset_counter_frequency_id > 0 && (
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="reset_counter_date"
                labelElement={<SettingsLabel label={t('next_reset')} />}
              />
            }
          >
            <InputField
              type="date"
              value={companyChanges?.settings?.reset_counter_date || ''}
              onValueChange={(value) =>
                handleChange('settings.reset_counter_date', value)
              }
              disabled={disableSettingsField('reset_counter_date')}
              errorMessage={errors?.errors['settings.reset_counter_date']}
            />
          </Element>
        )}
    </Card>
  );
}

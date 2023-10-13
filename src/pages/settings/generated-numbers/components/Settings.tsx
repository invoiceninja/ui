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
import { InputField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { SearchableSelect } from '$app/components/SearchableSelect';

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

  const companyChanges = useInjectCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const errors = useAtomValue(companySettingsErrorsAtom);

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('number_padding')}>
        <SearchableSelect
          value={companyChanges?.settings?.counter_padding || '1'}
          onValueChange={(value) =>
            handleChange('settings.counter_padding', value)
          }
          errorMessage={errors?.errors['settings.counter_padding']}
        >
          {COUNTER_PADDINGS.map((value, index) => (
            <option key={index} value={index + 1}>
              {value}
            </option>
          ))}
        </SearchableSelect>
      </Element>

      <Element leftSide={t('generate_number')}>
        <SearchableSelect
          value={
            companyChanges?.settings?.counter_number_applied || 'when_saved'
          }
          onValueChange={(value) =>
            handleChange('settings.counter_number_applied', value)
          }
          errorMessage={errors?.errors['settings.counter_number_applied']}
        >
          <option value="when_saved">{t('when_saved')}</option>
          <option value="when_sent">{t('when_sent')}</option>
        </SearchableSelect>
      </Element>

      <Element leftSide={t('recurring_prefix')}>
        <InputField
          value={companyChanges?.settings?.recurring_number_prefix || ''}
          onValueChange={(value) =>
            handleChange('settings.recurring_number_prefix', value)
          }
          errorMessage={errors?.errors['settings.recurring_number_prefix']}
        />
      </Element>

      <Element leftSide={t('shared_invoice_quote_counter')}>
        <Toggle
          onChange={(value: boolean) =>
            handleChange('settings.shared_invoice_quote_counter', value)
          }
          checked={Boolean(
            companyChanges?.settings?.shared_invoice_quote_counter
          )}
        />
      </Element>

      <Element leftSide={t('shared_invoice_credit_counter')}>
        <Toggle
          onChange={(value: boolean) =>
            handleChange('settings.shared_invoice_credit_counter', value)
          }
          checked={Boolean(
            companyChanges?.settings?.shared_invoice_credit_counter
          )}
        />
      </Element>

      <Element leftSide={t('reset_counter')}>
        <SearchableSelect
          value={companyChanges?.settings?.reset_counter_frequency_id || '0'}
          onValueChange={(value) =>
            handleChange('settings.reset_counter_frequency_id', parseInt(value))
          }
          errorMessage={errors?.errors['settings.reset_counter_frequency_id']}
        >
          {RESECT_COUNTER_FREQUENCIES.map((value, index) => (
            <option key={index} value={index}>
              {t(value)}
            </option>
          ))}
        </SearchableSelect>
      </Element>

      {companyChanges?.settings &&
        companyChanges?.settings?.reset_counter_frequency_id > 0 && (
          <Element leftSide={t('next_reset')}>
            <InputField
              type="date"
              value={companyChanges?.settings?.reset_counter_date || ''}
              onValueChange={(value) =>
                handleChange('settings.reset_counter_date', value)
              }
              errorMessage={errors?.errors['settings.reset_counter_date']}
            />
          </Element>
        )}
    </Card>
  );
}

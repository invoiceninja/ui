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

export function Settings() {
  const [t] = useTranslation();

  const companyChanges = useInjectCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const errors = useAtomValue(companySettingsErrorsAtom);

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('number_padding')}>
        <SelectField
          id="settings.counter_padding"
          value={companyChanges?.settings?.counter_padding || '1'}
          onValueChange={(value) =>
            handleChange('settings.counter_padding', value)
          }
          errorMessage={errors?.errors['settings.counter_padding']}
        >
          <option value="1">1</option>
          <option value="2">01</option>
          <option value="3">001</option>
          <option value="4">0001</option>
          <option value="5">00001</option>
          <option value="6">000001</option>
          <option value="7">0000001</option>
          <option value="8">00000001</option>
          <option value="9">000000001</option>
          <option value="10">0000000001</option>
        </SelectField>
      </Element>

      <Element leftSide={t('generate_number')}>
        <SelectField
          id="settings.counter_number_applied"
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
        </SelectField>
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
        <SelectField
          value={companyChanges?.settings?.reset_counter_frequency_id || '0'}
          onValueChange={(value) =>
            handleChange('settings.reset_counter_frequency_id', parseInt(value))
          }
          errorMessage={errors?.errors['settings.reset_counter_frequency_id']}
        >
          <option value="0">{t('never')}</option>
          <option value="1">{t('freq_daily')}</option>
          <option value="2">{t('freq_weekly')}</option>
          <option value="3">{t('freq_two_weeks')}</option>
          <option value="4">{t('freq_four_weeks')}</option>
          <option value="5">{t('freq_monthly')}</option>
          <option value="6">{t('freq_two_months')}</option>
          <option value="7">{t('freq_three_months')}</option>
          <option value="8">{t('freq_four_months')}</option>
          <option value="9">{t('freq_six_months')}</option>
          <option value="10">{t('freq_annually')}</option>
          <option value="11">{t('freq_two_years')}</option>
          <option value="12">{t('freq_three_years')}</option>
        </SelectField>
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

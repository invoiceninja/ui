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
import { Card, Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { useDispatch } from 'react-redux';
import { ChangeEvent } from 'react';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';

export function Settings() {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();
  const dispatch = useDispatch();

  useInjectCompanyChanges();

  const handleToggleChange = (id: string, value: boolean | string) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: event.target.id,
        value: event.target.value,
      })
    );

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('number_padding')}>
        <SelectField
          id="settings.counter_padding"
          onChange={handleChange}
          value={companyChanges?.settings?.counter_padding}
        >
          <option value="1">1</option>
          <option value="2">01</option>
          <option value="3">0001</option>
          <option value="4">00001</option>
          <option value="5">000001</option>
          <option value="6">0000001</option>
          <option value="7">00000001</option>
          <option value="8">000000001</option>
          <option value="9">0000000001</option>
        </SelectField>
      </Element>

      <Element leftSide={t('generate_number')}>
        <SelectField
          id="settings.counter_number_applied"
          onChange={handleChange}
          value={companyChanges?.settings?.counter_number_applied}
        >
          <option value="when_saved">{t('when_saved')}</option>
          <option value="when_sent">{t('when_sent')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('recurring_prefix')}>
        <InputField
          id="settings.recurring_number_prefix"
          value={companyChanges?.settings?.recurring_number_prefix}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('shared_invoice_quote_counter')}>
        <Toggle
          onChange={(value: boolean) =>
            handleToggleChange('settings.shared_invoice_quote_counter', value)
          }
          checked={
            companyChanges?.settings?.shared_invoice_quote_counter || false
          }
        />
      </Element>

      <Element leftSide={t('shared_invoice_credit_counter')}>
        <Toggle
          onChange={(value: boolean) =>
            handleToggleChange('settings.shared_invoice_credit_counter', value)
          }
          checked={
            companyChanges?.settings?.shared_invoice_credit_counter || false
          }
        />
      </Element>

      <Element leftSide={t('reset_counter')}>
        <SelectField
          id="settings.reset_counter_frequency_id"
          onChange={handleChange}
          value={companyChanges?.settings?.reset_counter_frequency_id}
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
      {companyChanges?.settings?.reset_counter_frequency_id > 0 && (
        <>
          <Element leftSide={t('next_reset')}>
            <InputField
              type="date"
              id="settings.reset_counter_date"
              onChange={handleChange}
              value={companyChanges?.settings?.reset_counter_date || ''}
            />
          </Element>
        </>
      )}
    </Card>
  );
}

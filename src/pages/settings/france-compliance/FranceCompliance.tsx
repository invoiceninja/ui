/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { Card, Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import Toggle from '$app/components/forms/Toggle';
import { Settings } from '$app/components/layouts/Settings';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { companySettingsErrorsAtom } from '../common/atoms';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';

type ReportingSchedule = 'ten_day' | 'monthly';

interface ReportingOption {
  id: ReportingSchedule;
  title: string;
  transactionFrequency: string;
  paymentFrequency: string;
}

export function FranceCompliance() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  useInjectCompanyChanges();
  useTitle('france_compliance');

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('france_compliance'), href: '/settings/france_compliance' },
  ];

  const companyChanges = useCompanyChanges();
  const errors = useAtomValue(companySettingsErrorsAtom);
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();
  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  const reportingEnabled = Boolean(
    companyChanges?.settings?.france_reporting_enabled ?? true
  );

  const reportingSchedule = (companyChanges?.settings?.france_reporting_schedule ??
    'ten_day') as ReportingSchedule;

  const options: ReportingOption[] = [
    {
      id: 'ten_day',
      title: t('france_reporting_ten_day'),
      transactionFrequency: t('france_reporting_transaction_every_10_days'),
      paymentFrequency: t('france_reporting_payment_monthly'),
    },
    {
      id: 'monthly',
      title: t('france_reporting_monthly'),
      transactionFrequency: t('france_reporting_transaction_monthly'),
      paymentFrequency: t('france_reporting_payment_monthly'),
    },
  ];

  const renderOption = (option: ReportingOption) => (
    <div key={option.id} className="flex items-start py-3">
      <input
        id={`france_reporting_${option.id}`}
        type="radio"
        name="france_reporting_schedule"
        value={option.id}
        checked={reportingSchedule === option.id}
        onChange={() =>
          handleChange('settings.france_reporting_schedule', option.id)
        }
        className="mt-1 h-4 w-4 cursor-pointer focus:ring-0 focus:ring-offset-0"
        style={{ color: 'black' }}
      />

      <label
        htmlFor={`france_reporting_${option.id}`}
        className="ml-3 flex flex-col cursor-pointer"
      >
        <span className="text-sm font-medium">{option.title}</span>
        <span className="text-xs mt-1" style={{ color: colors.$17 }}>
          {t('france_reporting_transaction_reports')}:{' '}
          {option.transactionFrequency}
        </span>
        <span className="text-xs" style={{ color: colors.$17 }}>
          {t('france_reporting_payment_reports')}: {option.paymentFrequency}
        </span>
      </label>
    </div>
  );

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('france_compliance')}
      breadcrumbs={pages}
      disableSaveButton={isFormBusy}
    >
      <Card title={t('reporting')}>
        <Element leftSide={t('france_reporting_enabled')}>
          <Toggle
            checked={reportingEnabled}
            onChange={(value) =>
              handleChange('settings.france_reporting_enabled', value)
            }
          />

          {errors?.errors?.['settings.france_reporting_enabled'] && (
            <p className="text-xs text-red-500 mt-1">
              {errors.errors['settings.france_reporting_enabled']}
            </p>
          )}
        </Element>

        {reportingEnabled && (
          <>
            <Divider withoutPadding />

            <div className="px-6 py-4">
              {options.map((option) => renderOption(option))}

              {errors?.errors?.['settings.france_reporting_schedule'] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.errors['settings.france_reporting_schedule']}
                </p>
              )}
            </div>

            <Divider withoutPadding />

            <div className="px-6 py-4">
              <p className="text-sm font-medium">
                {t('france_reporting_vat_exempt_info_title')}
              </p>
              <p className="text-xs mt-1" style={{ color: colors.$17 }}>
                {t('france_reporting_transaction_reports')}:{' '}
                {t('france_reporting_transaction_bi_monthly')}
              </p>
              <p className="text-xs" style={{ color: colors.$17 }}>
                {t('france_reporting_payment_reports')}:{' '}
                {t('france_reporting_payment_bi_monthly')}
              </p>
            </div>
          </>
        )}
      </Card>
    </Settings>
  );
}

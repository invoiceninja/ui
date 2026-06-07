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
import { Card, Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import Toggle from '$app/components/forms/Toggle';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { companySettingsErrorsAtom } from '../../../common/atoms';
import { useHandleCurrentCompanyChangeProperty } from '../../../common/hooks/useHandleCurrentCompanyChange';

type ReportingSchedule = 'ten_day' | 'monthly';

interface ReportingOption {
  id: ReportingSchedule;
  title: string;
  help: string;
}

export function FranceReporting() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const companyChanges = useCompanyChanges();
  const errors = useAtomValue(companySettingsErrorsAtom);
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const reportingEnabled = Boolean(
    companyChanges?.settings?.france_reporting_enabled ?? true
  );

  const reportingSchedule = (companyChanges?.settings?.france_reporting_schedule ??
    'ten_day') as ReportingSchedule;

  const options: ReportingOption[] = [
    {
      id: 'ten_day',
      title: t('ten_day_reporting'),
      help: t('ten_day_reporting_help')
    },
    {
      id: 'monthly',
      title: t('monthly_reporting'),
      help: t('monthly_reporting_help')
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

        <p className="text-sm font-medium">
          {option.title}
        </p>
        <p className="text-xs mt-1" style={{ color: colors.$17 }}>
          {option.help}
        </p>

      </label>
    </div>
  );

  return (
    <Card title={t('reports')}>
      <Element leftSide={t('e_reporting_enabled')}>
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

        </>
      )}
    </Card>
  );
}

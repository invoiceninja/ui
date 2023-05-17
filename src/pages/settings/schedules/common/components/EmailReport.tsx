/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { reports, Section } from '$app/pages/reports/index/Reports';
import { useTranslation } from 'react-i18next';

interface Props {
  schedule: Schedule;
  handleChange: (
    property: keyof Schedule,
    value: Schedule[keyof Schedule]
  ) => void;
  errors: ValidationBag | undefined;
}

export function EmailReport(props: Props) {
  const [t] = useTranslation();

  const { schedule, handleChange, errors } = props;

  const getReportsBySection = (section?: Section) => {
    return reports.filter((report) =>
      !section ? !report.section : report.section === section
    );
  };

  return (
    <>
      <Element leftSide={t('report')}>
        <SelectField
          value={schedule.parameters.report_name}
          onValueChange={(value) =>
            handleChange('parameters.report_name' as keyof Schedule, value)
          }
          errorMessage={errors?.errors.report_name}
        >
          {getReportsBySection().map((report, i) => (
            <option value={report.identifier} key={i}>
              {t(report.label)}
            </option>
          ))}

          <optgroup label={t('data') || ''}>
            {getReportsBySection('data').map((report, i) => (
              <option value={report.identifier} key={i}>
                {t(report.label)}
              </option>
            ))}
          </optgroup>

          <optgroup label={t('sales') || ''}>
            {getReportsBySection('sales').map((report, i) => (
              <option value={report.identifier} key={i}>
                {t(report.label)}
              </option>
            ))}
          </optgroup>

          <optgroup label={t('receivables') || ''}>
            {getReportsBySection('receivables').map((report, i) => (
              <option value={report.identifier} key={i}>
                {t(report.label)}
              </option>
            ))}
          </optgroup>

          <optgroup label={t('company') || ''}>
            {getReportsBySection('company').map((report, i) => (
              <option value={report.identifier} key={i}>
                {t(report.label)}
              </option>
            ))}
          </optgroup>

          <optgroup label={t('tax') || ''}>
            {getReportsBySection('tax').map((report, i) => (
              <option value={report.identifier} key={i}>
                {t(report.label)}
              </option>
            ))}
          </optgroup>
        </SelectField>
      </Element>

      <Element leftSide={t('date_range')}>
        <SelectField
          value={schedule.parameters.date_range}
          onValueChange={(value) =>
            handleChange('parameters.date_range' as keyof Schedule, value)
          }
          errorMessage={errors?.errors.date_range}
        >
          <option value="last7_days">{t('last7_days')}</option>
          <option value="last30_days">{t('last30_days')}</option>
          <option value="last365_days">{t('last365_days')}</option>
          <option value="this_month">{t('this_month')}</option>
          <option value="last_month">{t('last_month')}</option>
          <option value="this_quarter">{t('this_quarter')}</option>
          <option value="last_quarter">{t('last_quarter')}</option>
          <option value="this_year">{t('this_year')}</option>
          <option value="last_year">{t('last_year')}</option>
        </SelectField>
      </Element>
    </>
  );
}

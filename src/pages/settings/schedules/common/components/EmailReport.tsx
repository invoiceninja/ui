/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useReports } from '$app/pages/reports/common/useReports';
import { useTranslation } from 'react-i18next';

interface Props {
  schedule: Schedule;
  handleChange: (
    property: keyof Schedule,
    value: Schedule[keyof Schedule]
  ) => void;
  errors: ValidationBag | undefined;
}

type ReportFiled =
  | 'send_email'
  | 'range'
  | 'status'
  | 'products'
  | 'client'
  | 'expensed_reporting'
  | 'accrual_accounting'
  | 'include_tax';

const DEFAULT_REPORT_FIELDS: ReportFiled[] = ['send_email', 'range'];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const REPORTS_FIELDS: Record<string, ReportFiled[]> = {
  invoice: [...DEFAULT_REPORT_FIELDS, 'status'],
  invoice_item: [...DEFAULT_REPORT_FIELDS, 'products'],
  product_sales: [...DEFAULT_REPORT_FIELDS, 'products', 'client'],
  profit_and_loss: [
    ...DEFAULT_REPORT_FIELDS,
    'expensed_reporting',
    'accrual_accounting',
    'include_tax',
  ],
};

export function EmailReport(props: Props) {
  const [t] = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatMoney = useFormatMoney();

  const reports = useReports();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { schedule, handleChange, errors } = props;

  return (
    <>
      <Element leftSide={t('report')}>
        <SelectField
          value={schedule.parameters.report_name}
          onValueChange={(value) =>
            handleChange('parameters.report_name' as keyof Schedule, value)
          }
        >
          {reports.map((report, i) => (
            <option value={report.identifier} key={i}>
              {t(report.label)}
            </option>
          ))}
        </SelectField>
      </Element>
    </>
  );
}

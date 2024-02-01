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
import { InputField, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { ProductItemsSelector } from '$app/pages/reports/common/components/ProductItemsSelector';
import { StatusSelector } from '$app/pages/reports/common/components/StatusSelector';
import { useReports } from '$app/pages/reports/common/useReports';
import { ranges } from '$app/pages/reports/index/Reports';
import { useTranslation } from 'react-i18next';
import { ClientSelector } from '$app/components/clients/ClientSelector';

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
  | 'expense_billed'
  | 'income_billed'
  | 'start_date'
  | 'end_date'
  | 'include_tax'
  | 'document_email_attachment';

export const DEFAULT_REPORT_FIELDS: ReportFiled[] = [
  'send_email',
  'range',
  'start_date',
  'end_date',
];

export const REPORTS_FIELDS: Record<string, ReportFiled[]> = {
  invoice: [...DEFAULT_REPORT_FIELDS, 'status', 'document_email_attachment'],
  invoice_item: [
    ...DEFAULT_REPORT_FIELDS,
    'products',
    'document_email_attachment',
  ],
  product_sales: [...DEFAULT_REPORT_FIELDS, 'products', 'client'],
  profitloss: [
    ...DEFAULT_REPORT_FIELDS,
    'expense_billed',
    'income_billed',
    'include_tax',
  ],
  client: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  quote: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  quote_item: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  credit: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  document: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  payment: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  expense: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  task: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  product: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  vendor: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  purchase_order: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
  purchase_order_item: [...DEFAULT_REPORT_FIELDS, 'document_email_attachment'],
};

export function EmailReport(props: Props) {
  const [t] = useTranslation();
  const reports = useReports();

  const { schedule, handleChange, errors } = props;

  const showReportFiled = (field: ReportFiled) => {
    return (
      REPORTS_FIELDS[schedule.parameters.report_name] || DEFAULT_REPORT_FIELDS
    ).includes(field);
  };

  return (
    <>
      <Element leftSide={t('report')}>
        <SelectField
          value={schedule.parameters.report_name}
          onValueChange={(value) =>
            handleChange('parameters.report_name' as keyof Schedule, value)
          }
          errorMessage={errors?.errors['parameters.report_name']}
          cypressRef="scheduleReportName"
        >
          {reports.map((report, i) => (
            <option value={report.identifier} key={i}>
              {t(report.label)}
            </option>
          ))}
        </SelectField>
      </Element>

      {showReportFiled('send_email') && (
        <Element leftSide={t('send_email')}>
          <Toggle
            checked={schedule.parameters.send_email}
            onValueChange={(value) =>
              handleChange('parameters.send_email' as keyof Schedule, value)
            }
            disabled
            cypressRef="scheduleSendEmail"
          />
        </Element>
      )}

      {showReportFiled('document_email_attachment') && (
        <Element leftSide={t('document_email_attachment')}>
          <Toggle
            checked={schedule.parameters.document_email_attachment}
            onValueChange={(value) =>
              handleChange(
                'parameters.document_email_attachment' as keyof Schedule,
                value
              )
            }
            cypressRef="scheduleDocumentEmailAttachment"
          />
        </Element>
      )}

      {showReportFiled('expense_billed') && (
        <Element leftSide={t('expense_paid_report')}>
          <Toggle
            checked={schedule.parameters.is_expense_billed}
            onValueChange={(value) =>
              handleChange(
                'parameters.is_expense_billed' as keyof Schedule,
                value
              )
            }
            cypressRef="expenseBilled"
          />
        </Element>
      )}

      {showReportFiled('income_billed') && (
        <Element leftSide={t('cash_vs_accrual')}>
          <Toggle
            checked={schedule.parameters.is_income_billed}
            onValueChange={(value) =>
              handleChange(
                'parameters.is_income_billed' as keyof Schedule,
                value
              )
            }
            cypressRef="incomeBilled"
          />
        </Element>
      )}

      {showReportFiled('include_tax') && (
        <Element leftSide={t('include_tax')}>
          <Toggle
            checked={schedule.parameters.include_tax}
            onValueChange={(value) =>
              handleChange('parameters.include_tax' as keyof Schedule, value)
            }
            cypressRef="includeTax"
          />
        </Element>
      )}

      {showReportFiled('status') && (
        <Element leftSide={t('status')}>
          <StatusSelector
            value={schedule.parameters.status}
            onValueChange={(value) =>
              handleChange('parameters.status' as keyof Schedule, value)
            }
            errorMessage={errors?.errors['parameters.status']}
          />
        </Element>
      )}

      {showReportFiled('products') && (
        <ProductItemsSelector
          value={schedule.parameters.product_key}
          onValueChange={(value) =>
            handleChange('parameters.product_key' as keyof Schedule, value)
          }
          errorMessage={errors?.errors['parameters.product_key']}
        />
      )}

      {showReportFiled('range') && (
        <Element leftSide={t('range')}>
          <SelectField
            value={schedule.parameters.date_range}
            onValueChange={(value) =>
              handleChange('parameters.date_range' as keyof Schedule, value)
            }
            errorMessage={errors?.errors['parameters.date_range']}
            cypressRef="scheduleDateRange"
          >
            {ranges.map((range, i) => (
              <option value={range.scheduleIdentifier} key={i}>
                {t(range.label)}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      {showReportFiled('range') &&
        schedule.parameters.date_range === 'custom' && (
          <>
            <Element leftSide={t('start_date')}>
              <InputField
                type="date"
                value={schedule.parameters.start_date}
                onValueChange={(value) =>
                  handleChange('parameters.start_date' as keyof Schedule, value)
                }
                errorMessage={errors?.errors['parameters.start_date']}
                cypressRef="scheduleStartDate"
              />
            </Element>

            <Element leftSide={t('end_date')}>
              <InputField
                type="date"
                value={schedule.parameters.end_date}
                onValueChange={(value) =>
                  handleChange('parameters.end_date' as keyof Schedule, value)
                }
                errorMessage={errors?.errors['parameters.end_date']}
                cypressRef="scheduleEndDate"
              />
            </Element>
          </>
        )}

      {showReportFiled('client') && (
        <Element leftSide={t('client')}>
          <ClientSelector
            value={schedule.parameters.client_id}
            onChange={(client) =>
              handleChange('parameters.client_id' as keyof Schedule, client.id)
            }
            clearButton
            onClearButtonClick={() =>
              handleChange('parameters.client_id' as keyof Schedule, '')
            }
            withoutAction={true}
            errorMessage={errors?.errors['parameters.client_id']}
          />
        </Element>
      )}
    </>
  );
}

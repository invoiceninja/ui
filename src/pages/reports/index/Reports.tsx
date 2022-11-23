/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useTitle } from 'common/hooks/useTitle';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Page } from 'components/Breadcrumbs';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Identifier =
  | 'client'
  | 'contact'
  | 'credit'
  | 'document'
  | 'expense'
  | 'invoice'
  | 'invoice_item'
  | 'quote'
  | 'quote_item'
  | 'recurring_invoice'
  | 'payment'
  | 'product'
  | 'task'
  | 'profitloss';

interface Report {
  identifier: Identifier;
  label: string;
  endpoint: string;
  payload: Payload;
}

interface Payload {
  start_date: string;
  end_date: string;
  date_key?: string;
  date_range: string;
  report_keys: string[];
  send_email: boolean;
  is_income_billed?: boolean;
  is_expense_billed?: boolean;
  include_tax?: boolean;
}

const reports: Report[] = [
  {
    identifier: 'client',
    label: 'client',
    endpoint: '/api/v1/reports/clients',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'contact',
    label: 'contact',
    endpoint: '/api/v1/reports/contacts',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'credit',
    label: 'credit',
    endpoint: '/api/v1/reports/credits',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'document',
    label: 'document',
    endpoint: '/api/v1/reports/documents',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'expense',
    label: 'expense',
    endpoint: '/api/v1/reports/expenses',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'invoice',
    label: 'invoice',
    endpoint: '/api/v1/reports/invoices',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'invoice_item',
    label: 'invoice_item',
    endpoint: '/api/v1/reports/invoice_items',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'quote',
    label: 'quote',
    endpoint: '/api/v1/reports/quotes',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'quote_item',
    label: 'quote_item',
    endpoint: '/api/v1/reports/quote_items',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'recurring_invoice',
    label: 'recurring_invoice',
    endpoint: '/api/v1/reports/recurring_invoices',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'payment',
    label: 'payment',
    endpoint: '/api/v1/reports/payments',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'product',
    label: 'product',
    endpoint: '/api/v1/reports/products',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'task',
    label: 'task',
    endpoint: '/api/v1/reports/tasks',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
  },
  {
    identifier: 'profitloss',
    label: 'profitloss',
    endpoint: '/api/v1/reports/profitloss',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
      is_expense_billed: false,
      is_income_billed: false,
      include_tax: false,
    },
  },
];

interface Range {
  identifier: string;
  label: string;
}

const ranges: Range[] = [
  { identifier: 'all', label: 'all' },
  { identifier: 'last7', label: 'last_7_days' },
  { identifier: 'last30', label: 'last_30_days' },
  { identifier: 'this_month', label: 'this_month' },
  { identifier: 'last_month', label: 'last_month' },
  { identifier: 'this_quarter', label: 'this_quarter' },
  { identifier: 'last_quarter', label: 'last_quarter' },
  { identifier: 'this_year', label: 'this_year' },
  { identifier: 'custom', label: 'custom' },
];

export function Reports() {
  const { documentTitle } = useTitle('reports');
  const { t } = useTranslation();

  const [report, setReport] = useState<Report>(reports[0]);
  const [isPendingExport, setIsPendingExport] = useState(false);
  const [errors, setErrors] = useState<ValidationBag>();

  const pages: Page[] = [{ name: t('reports'), href: '/reports' }];

  const handleReportChange = (identifier: Identifier) => {
    const report = reports.find((report) => report.identifier === identifier);

    if (report) {
      setReport(report);
    }
  };

  const handlePayloadChange = (
    property: keyof Payload,
    value: string | number | boolean
  ) => {
    setReport((current) => ({
      ...current,
      payload: { ...current.payload, [property]: value },
    }));
  };

  const handleRangeChange = (identifier: string) => {
    const range = ranges.find((range) => range.identifier === identifier);

    if (range) {
      setReport((current) => ({
        ...current,
        payload: { ...current.payload, date_range: range.identifier },
      }));
    }
  };

  const handleCustomDateChange = (
    key: 'start_date' | 'end_date',
    date: string
  ) => {
    setReport((current) => ({
      ...current,
      payload: { ...current.payload, [key]: date },
    }));
  };

  const handleSendEmailChange = (value: boolean) => {
    setReport((current) => ({
      ...current,
      payload: { ...current.payload, send_email: value },
    }));
  };

  const handleExport = () => {
    toast.processing();

    setIsPendingExport(true);
    setErrors(undefined);

    request('POST', endpoint(report.endpoint), report.payload, {
      responseType: report.payload.send_email ? 'json' : 'blob',
    })
      .then((response) => {
        if (report.payload.send_email) {
          return toast.success();
        }

        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.download = `${report.identifier}.csv`;
        link.href = url;
        link.target = '_blank';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        toast.success();
      })
      .catch((error: AxiosError) => {
        console.error(error);

        if (error.response?.status === 422) {
          if (report.payload.send_email) {
            setErrors(error.response.data);
          }

          if (!report.payload.send_email) {
            const blob = error.response.data as Blob;

            blob.text().then((text) => setErrors(JSON.parse(text)));
          }
        }

        toast.error();
      })
      .finally(() => setIsPendingExport(false));
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={handleExport}
      saveButtonLabel={t('export')}
      disableSaveButton={isPendingExport}
    >
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-6 h-max">
          <Element leftSide={t('report')}>
            <SelectField
              onValueChange={(value) => handleReportChange(value as Identifier)}
              value={report.identifier}
            >
              {reports.map((report, i) => (
                <option value={report.identifier} key={i}>
                  {t(report.label)}
                </option>
              ))}
            </SelectField>
          </Element>

          <Element leftSide={t('send_email')}>
            <Toggle
              checked={report.payload.send_email}
              onValueChange={handleSendEmailChange}
            />
          </Element>

          {report.identifier === 'profitloss' && (
            <>
              <Element leftSide={t('is_expense_billed')}>
                <Toggle
                  checked={report.payload.is_expense_billed}
                  onValueChange={(value) =>
                    handlePayloadChange('is_expense_billed', value)
                  }
                />
              </Element>

              <Element leftSide={t('is_income_billed')}>
                <Toggle
                  checked={report.payload.is_income_billed}
                  onValueChange={(value) =>
                    handlePayloadChange('is_income_billed', value)
                  }
                />
              </Element>

              <Element leftSide={t('include_tax')}>
                <Toggle
                  checked={report.payload.include_tax}
                  onValueChange={(value) =>
                    handlePayloadChange('include_tax', value)
                  }
                />
              </Element>
            </>
          )}
        </Card>

        <Card className="col-span-6 h-max">
          <Element leftSide={t('range')}>
            <SelectField
              onValueChange={(value) => handleRangeChange(value)}
              value={report.payload.date_range}
            >
              {ranges.map((range, i) => (
                <option value={range.identifier} key={i}>
                  {t(range.label)}
                </option>
              ))}
            </SelectField>
          </Element>

          {report.payload.date_range === 'custom' && (
            <Element leftSide={t('start_date')}>
              <InputField
                type="date"
                value={report.payload.start_date}
                onValueChange={(value) =>
                  handleCustomDateChange('start_date', value)
                }
                errorMessage={errors?.errors?.start_date}
              />
            </Element>
          )}

          {report.payload.date_range === 'custom' && (
            <Element leftSide={t('end_date')}>
              <InputField
                type="date"
                value={report.payload.end_date}
                onValueChange={(value) =>
                  handleCustomDateChange('end_date', value)
                }
                errorMessage={errors?.errors?.end_date}
              />
            </Element>
          )}
        </Card>
      </div>
    </Default>
  );
}

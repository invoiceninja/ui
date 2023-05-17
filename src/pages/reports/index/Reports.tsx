/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import Toggle from '$app/components/forms/Toggle';
import { Default } from '$app/components/layouts/Default';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdDownload, MdPrint, MdSchedule } from 'react-icons/md';
import { useInvoiceFilters } from '$app/pages/invoices/common/hooks/useInvoiceFilters';
import { MultiValue, StylesConfig } from 'react-select';
import { SelectOption } from '$app/components/datatables/Actions';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { useScheduleReport } from '../common/hooks/useScheduleReport';

export type Identifier =
  | 'activity'
  | 'clients'
  | 'client_contacts'
  | 'credits'
  | 'documents'
  | 'expenses'
  | 'invoices'
  | 'invoice_items'
  | 'quotes'
  | 'quote_items'
  | 'recurring_invoices'
  | 'payments'
  | 'products'
  | 'product_sales'
  | 'tasks'
  | 'profitloss'
  | 'client_balance'
  | 'client_sales'
  | 'ar_detailed'
  | 'ar_summary'
  | 'user_sales'
  | 'tax_summary';

export type Section = 'sales' | 'company' | 'receivables' | 'tax' | 'data';

export interface Report {
  identifier: Identifier;
  label: string;
  endpoint: string;
  payload: Payload;
  section?: Section;
}

interface Payload {
  start_date: string;
  end_date: string;
  date_key?: string;
  client_id?: string;
  date_range: string;
  report_keys: string[];
  send_email: boolean;
  is_income_billed?: boolean;
  is_expense_billed?: boolean;
  include_tax?: boolean;
  status?: string;
}

export const reports: Report[] = [
  {
    identifier: 'activity',
    label: 'activity',
    endpoint: '/api/v1/reports/activities',
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
    identifier: 'clients',
    label: 'clients',
    endpoint: '/api/v1/reports/clients',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'client_contacts',
    label: 'client_contacts',
    endpoint: '/api/v1/reports/contacts',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'credits',
    label: 'credits',
    endpoint: '/api/v1/reports/credits',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'documents',
    label: 'documents',
    endpoint: '/api/v1/reports/documents',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'expenses',
    label: 'expenses',
    endpoint: '/api/v1/reports/expenses',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'invoices',
    label: 'invoices',
    endpoint: '/api/v1/reports/invoices',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
      status: '',
    },
    section: 'data',
  },
  {
    identifier: 'invoice_items',
    label: 'invoice_items',
    endpoint: '/api/v1/reports/invoice_items',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'quotes',
    label: 'quotes',
    endpoint: '/api/v1/reports/quotes',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'quote_items',
    label: 'quote_items',
    endpoint: '/api/v1/reports/quote_items',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'recurring_invoices',
    label: 'recurring_invoices',
    endpoint: '/api/v1/reports/recurring_invoices',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'payments',
    label: 'payments',
    endpoint: '/api/v1/reports/payments',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'products',
    label: 'products',
    endpoint: '/api/v1/reports/products',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
  },
  {
    identifier: 'product_sales',
    label: 'product_sales',
    endpoint: '/api/v1/reports/product_sales',
    payload: {
      start_date: '',
      end_date: '',
      client_id: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'sales',
  },
  {
    identifier: 'tasks',
    label: 'tasks',
    endpoint: '/api/v1/reports/tasks',
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: 'all',
      report_keys: [],
      send_email: false,
    },
    section: 'data',
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
    section: 'company',
  },
  {
    identifier: 'ar_detailed',
    label: 'ar_detailed',
    endpoint: '/api/v1/reports/ar_detail_report',
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
    section: 'receivables',
  },
  {
    identifier: 'ar_summary',
    label: 'ar_summary',
    endpoint: '/api/v1/reports/ar_summary_report',
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
    section: 'receivables',
  },
  {
    identifier: 'client_balance',
    label: 'client_balance',
    endpoint: '/api/v1/reports/client_balance_report',
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
    section: 'receivables',
  },
  {
    identifier: 'client_sales',
    label: 'client_sales',
    endpoint: '/api/v1/reports/client_sales_report',
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
    section: 'sales',
  },
  {
    identifier: 'tax_summary',
    label: 'tax_summary',
    endpoint: '/api/v1/reports/tax_summary_report',
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
    section: 'tax',
  },
  {
    identifier: 'user_sales',
    label: 'user_sales',
    endpoint: '/api/v1/reports/user_sales_report',
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
    section: 'sales',
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

export default function Reports() {
  const { documentTitle } = useTitle('reports');
  const { t } = useTranslation();

  const scheduleReport = useScheduleReport();

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

  const getReportsBySection = (section?: Section) => {
    return reports.filter((report) =>
      !section ? !report.section : report.section === section
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStatusChange = (
    statuses: MultiValue<{ value: string; label: string }>
  ) => {
    const values: Array<string> = [];

    (statuses as SelectOption[]).map(
      (option: { value: string; label: string }) => values.push(option.value)
    );

    setReport((current) => ({
      ...current,
      payload: { ...current.payload, status: values.join(',') },
    }));
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

  const handleExport = (exportType: string) => {
    toast.processing();

    setIsPendingExport(true);
    setErrors(undefined);

    const { client_id } = report.payload;

    const updatedPayload =
      report.identifier === 'product_sales'
        ? { ...report.payload, client_id: client_id || null }
        : report.payload;

    request('POST', endpoint(report.endpoint), updatedPayload, {
      responseType: report.payload.send_email ? 'json' : 'blob',
    })
      .then((response) => {
        if (report.payload.send_email) {
          return toast.success();
        }

        const blob = new Blob([response.data], { type: `text/${exportType}` });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.download = `${report.identifier}.${exportType}`;
        link.href = url;
        link.target = '_blank';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        toast.success();
      })
      .catch((error: AxiosError<ValidationBag | Blob>) => {
        console.error(error);

        if (error.response?.status === 422) {
          if (report.payload.send_email) {
            setErrors(error.response.data as ValidationBag);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const customStyles: StylesConfig<SelectOption, true> = {
    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: data.backgroundColor,
        color: data.color,
        borderRadius: '3px',
      };
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      ':hover': {
        color: 'white',
      },
      color: '#999999',
    }),
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filters = useInvoiceFilters();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      withoutBackButton
      navigationTopRight={
        <Dropdown label={t('more_actions')}>
          <DropdownElement
            onClick={() => !isPendingExport && handleExport('xlsx')}
            icon={<Icon element={MdDownload} />}
          >
            {t('export_as_xlsx')}
          </DropdownElement>

          <DropdownElement
            onClick={() => !isPendingExport && handleExport('csv')}
            icon={<Icon element={MdDownload} />}
          >
            {t('export_as_csv')}
          </DropdownElement>

          <DropdownElement
            onClick={() =>
              !isPendingExport &&
              scheduleReport(report.identifier, report.payload.date_range)
            }
            icon={<Icon element={MdSchedule} />}
          >
            {t('schedule')}
          </DropdownElement>

          <DropdownElement icon={<Icon element={MdPrint} />}>
            {t('print_pdf')}
          </DropdownElement>
        </Dropdown>
      }
    >
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-6 h-max">
          <Element leftSide={t('report')}>
            <SelectField
              value={report.identifier}
              onValueChange={(value) => handleReportChange(value as Identifier)}
              withBlank
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

          <Element leftSide={t('report_template')}>
            <SelectField
              //value={report.identifier}
              //onValueChange={(value) => handleReportChange(value as Identifier)}
              withBlank
            >
              <optgroup label="Financial Reports">
                <option value="1">Client Balance Report</option>
                <option value="2">Vendor Expenses Report</option>
                <option value="3">Bank Account Summary Report</option>
                <option value="4">
                  Transaction by Account and Category Report
                </option>
                <option value="5">Transaction by Date Range Report</option>
              </optgroup>

              <optgroup label="Sales Reports">
                <option value="6">Product Sales Summary Report</option>
                <option value="7">Invoice Summary Report</option>
                <option value="8">Quote Summary Report</option>
                <option value="9">Credit Summary Report</option>
                <option value="10">Revenue by Product Category Report</option>
              </optgroup>

              <optgroup label="Expense Reports">
                <option value="11">Expense Summary by Category Report</option>
                <option value="12">Expense Summary by Client Report</option>
                <option value="13">Expense Summary by Vendor Report</option>
                <option value="14">Recurring Expense Summary Report</option>
                <option value="15">Expense Details by Date Range Report</option>
              </optgroup>

              <optgroup label="Payment Reports">
                <option value="16">Payment Summary by Client Report</option>
                <option value="17">Payment Summary by Vendor Report</option>
                <option value="18">Payment Summary by Invoice Report</option>
                <option value="19">Payment Details by Date Range Report</option>
              </optgroup>

              <optgroup label="Project Reports">
                <option value="20">Project Summary by Client Report</option>
                <option value="21">Project Summary by Status Report</option>
                <option value="22">Project Task Summary Report</option>
              </optgroup>

              <optgroup label="Task Reports">
                <option value="23">Task Summary by Project Report</option>
                <option value="24">Task Summary by Client Report</option>
                <option value="25">Task Summary by User Report</option>
                <option value="26">Task Details by Date Range Report</option>
              </optgroup>

              <optgroup label="Purchase Order Reports">
                <option value="27">
                  Purchase Order Summary by Vendor Report
                </option>
                <option value="28">
                  Purchase Order Summary by Client Report
                </option>
                <option value="29">
                  Purchase Order Summary by Status Report
                </option>
                <option value="30">
                  Purchase Order Details by Date Range Report
                </option>
              </optgroup>
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
              <Element leftSide={t('expense_paid_report')}>
                <Toggle
                  checked={report.payload.is_expense_billed}
                  onValueChange={(value) =>
                    handlePayloadChange('is_expense_billed', value)
                  }
                />
              </Element>

              <Element leftSide={t('cash_vs_accrual')}>
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

          {report.identifier === 'product_sales' && (
            <Element leftSide={t('client')}>
              <ClientSelector
                value={report.payload.client_id}
                onChange={(client) =>
                  handlePayloadChange('client_id', client.id)
                }
                clearButton
                onClearButtonClick={() => handlePayloadChange('client_id', '')}
                withoutAction={true}
              />
            </Element>
          )}
        </Card>
      </div>
    </Default>
  );
}

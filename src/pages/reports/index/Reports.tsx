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
import { useGetAvailableReports } from '../common/hooks/useGetAvailableReports';
import { ColumnSelection } from '../common/components/ColumnSelection';
import { ColumnFiltering } from '../common/components/ColumnFiltering';
import { Client } from '$app/common/interfaces/client';

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

type BlankEntity = Client;

export interface Report {
  identifier: Identifier;
  label: string;
  endpoint: string;
  payload: Payload;
  section?: Section;
  availableKeys?: string[] | undefined;
  blankEntity?: BlankEntity;
  entityName?: string;
}

export interface Filter {
  key: string;
  operator: string;
  value: string;
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
  filters?: Filter[];
}

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

  const reports = useGetAvailableReports();

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
        <Card className="col-span-7 h-max">
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

          <ColumnSelection report={report} setReport={setReport} />

          <ColumnFiltering report={report} setReport={setReport} />

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

        <Card className="col-span-5 h-max">
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

          <Element leftSide={t('send_email')}>
            <Toggle
              checked={report.payload.send_email}
              onValueChange={handleSendEmailChange}
            />
          </Element>
        </Card>
      </div>
    </Default>
  );
}

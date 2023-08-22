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
import { Button, InputField, Link, SelectField } from '$app/components/forms';
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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInvoiceFilters } from '$app/pages/invoices/common/hooks/useInvoiceFilters';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { SelectOption } from '$app/components/datatables/Actions';
import {
  SortableColumns,
  reportColumn,
} from '../common/components/SortableColumns';
import { useReports } from '../common/useReports';
import { usePreferences } from '$app/common/hooks/usePreferences';
import collect from 'collect.js';
import { atom, useAtom } from 'jotai';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { useQueryClient } from 'react-query';
import { cloneDeep } from 'lodash';
import { BiSortAlt2 } from 'react-icons/bi';

export type Identifier =
  | 'activity'
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
  | 'product_sales'
  | 'task'
  | 'vendor'
  | 'purchase_order'
  | 'purchase_order_item'
  | 'profitloss'
  | 'client_balance_report'
  | 'client_sales_report'
  | 'aged_receivable_detailed_report'
  | 'aged_receivable_summary_report'
  | 'user_sales_report'
  | 'tax_summary_report';

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

interface Report {
  identifier: Identifier;
  label: string;
  endpoint: string;
  payload: Payload;
  custom_columns: string[];
  allow_custom_column: boolean;
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

export default function Reports() {
  const { documentTitle } = useTitle('reports');
  const { t } = useTranslation();

  const reports = useReports();

  const [report, setReport] = useState<Report>(reports[0]);
  const [isPendingExport, setIsPendingExport] = useState(false);
  const [errors, setErrors] = useState<ValidationBag>();
  const [showCustomColumns, setShowCustomColumns] = useState(false);

  const { save, preferences } = usePreferences();

  const pages: Page[] = [{ name: t('reports'), href: '/reports' }];

  const handleReportChange = (identifier: Identifier) => {
    const report = reports.find((report) => report.identifier === identifier);

    setShowCustomColumns(false);

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

  const handleExport = () => {
    toast.processing();

    setIsPendingExport(true);
    setErrors(undefined);

    const { client_id } = report.payload;

    let updatedPayload =
      report.identifier === 'product_sales'
        ? { ...report.payload, client_id: client_id || null }
        : report.payload;

    let reportKeys: string[] = [];

    if (report.identifier in preferences.reports.columns && showCustomColumns) {
      reportKeys = collect(
        preferences.reports.columns[report.identifier][reportColumn]
      )
        .pluck('value')
        .toArray() as string[];
    }

    updatedPayload = { ...updatedPayload, report_keys: reportKeys };

    request('POST', endpoint(report.endpoint), updatedPayload, {
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
      .catch((error: AxiosError<ValidationBag | Blob>) => {
        if (error.response?.status === 422) {
          if (report.payload.send_email) {
            setErrors(error.response.data as ValidationBag);
          }

          if (!report.payload.send_email) {
            const blob = error.response.data as Blob;

            blob.text().then((text) => setErrors(JSON.parse(text)));
          }
        }
      })
      .finally(() => {
        setIsPendingExport(false);
        save({ silent: true });
      });
  };

  const [preview, setPreview] = useAtom(previewAtom);

  const queryClient = useQueryClient();

  const handlePreview = async () => {
    setErrors(undefined);
    setPreview(null);

    const { client_id } = report.payload;

    let updatedPayload =
      report.identifier === 'product_sales'
        ? { ...report.payload, client_id: client_id || null }
        : report.payload;

    let reportKeys: string[] = [];

    if (report.identifier in preferences.reports.columns && showCustomColumns) {
      reportKeys = collect(
        preferences.reports.columns[report.identifier][reportColumn]
      )
        .pluck('value')
        .toArray() as string[];
    }

    updatedPayload = { ...updatedPayload, report_keys: reportKeys };

    request(
      'POST',
      endpoint('/api/v1/reports/credits?output=json'),
      updatedPayload,
      {}
    ).then((response) => {
      const hash = response.data.message as string;

      queryClient
        .fetchQuery({
          queryKey: ['reports', hash],
          queryFn: () =>
            request('POST', endpoint(`/api/v1/reports/preview/${hash}`)).then(
              (response) => response.data
            ),
          retry: 10,
          retryDelay: import.meta.env.DEV ? 1000 : 5000,
        })
        .then((value) => {
          setPreview(value);
          toast.success();
        });
    });
  };

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

  const filters = useInvoiceFilters();

  useEffect(() => {
    return () => {
      queryClient.cancelQueries(['reports']);
      toast.dismiss();
    };
  }, []);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={handleExport}
      saveButtonLabel={t('export')}
      disableSaveButton={isPendingExport}
      navigationTopRight={
        <Button type="secondary" onClick={handlePreview}>
          {t('preview')}
        </Button>
      }
      withoutBackButton
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

          {report.identifier === 'invoice' && (
            <Element leftSide={t('status')} className={'mb-50 py-50'}>
              <Select
                styles={customStyles}
                defaultValue={null}
                onChange={(options) => handleStatusChange(options)}
                placeholder={t('status')}
                options={filters}
                isMulti={true}
              />
            </Element>
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

          {report.allow_custom_column && (
            <Element leftSide={`${t('customize')} ${t('columns')}`}>
              <Toggle
                checked={showCustomColumns}
                onValueChange={(value) => setShowCustomColumns(Boolean(value))}
              />
            </Element>
          )}
        </Card>
      </div>

      {showCustomColumns && (
        <SortableColumns
          report={report.identifier}
          columns={report.custom_columns}
        />
      )}

      {preview && <Preview />}
    </Default>
  );
}

const previewAtom = atom<PreviewRecord[][] | null>(null);
const previewFiltersAtom = atom<Record<string, string>>({});
const previewSortsAtom = atom<Record<string, string>>({});

export interface PreviewRecord {
  entity: string;
  id: string;
  hashed_id: null;
  value: string;
  display_value: string | JSX.Element | number;
}

function usePreview() {
  const [preview] = useAtom(previewAtom);
  const [processed, setProcessed] = useState<PreviewRecord[][] | null>(null);

  useEffect(() => {
    if (!preview) {
      return;
    }

    const copy = cloneDeep(preview);

    copy.map((row, i) => {
      if (i === 0) {
        // We are working with columns, skip this for processing.

        return;
      }

      row.map((cell) => {
        if (cell.entity === 'credit' && cell.id === 'number') {
          cell.display_value = (
            <Link to={`/credits/${cell.value}`}>{cell.display_value}</Link>
          );
        }
      });
    });

    setProcessed(copy);
  }, [preview]);

  return processed;
}

function Preview() {
  const preview = usePreview();
  const [filtered, setFiltered] = useState<PreviewRecord[][] | null>(null);
  const [previewFilters, setPreviewFilters] = useAtom(previewFiltersAtom);
  const [previewSorts, setPreviewSorts] = useAtom(previewSortsAtom);

  if (!preview) {
    return null;
  }

  const columns = preview[0] as unknown as string[];

  const filter = (column: string, value: string) => {
    setPreviewFilters((current) => ({ ...current, [column]: value }));

    const filtered = preview.filter((sub) =>
      sub.some((item) => {
        if (!Object.hasOwn(item, 'display_value')) {
          return false;
        }

        if (item.id !== column) {
          return false;
        }

        if (typeof item.display_value === 'number') {
          return item.display_value
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        }

        if (typeof item.display_value === 'string') {
          return item.display_value.toLowerCase().includes(value.toLowerCase());
        }

        if (typeof item.display_value === 'object') {
          return item.display_value.props.children
            .toLowerCase()
            .includes(value.toLowerCase());
        }
      })
    );

    setFiltered(filtered);
  };

  const data = filtered || preview;

  if (preview) {
    return (
      <div id="preview-table">
        {JSON.stringify(previewFilters)}

        <Table>
          <Thead>
            {columns.map((column: string, i) => (
              <Th key={i}>
                <div
                  // onClick={() => sort(i)}
                  className="cursor-pointer inline-flex items-center space-x-2"
                >
                  <p>{column}</p> <BiSortAlt2 />
                </div>
              </Th>
            ))}
          </Thead>
          <Tbody>
            {preview.length > 0 &&
              preview[1].map((cell, i) => (
                <Td key={i}>
                  <InputField
                    onValueChange={(value) => filter(cell.id, value)}
                  />
                </Td>
              ))}

            {data.map(
              (row, i) =>
                row.length > 0 &&
                Object.hasOwn(row[0], 'display_value') && (
                  <Tr key={i}>
                    {row.map((cell, j) => (
                      <Td key={j}>{cell.display_value}</Td>
                    ))}
                  </Tr>
                )
            )}
          </Tbody>
        </Table>
      </div>
    );
  }

  return null;
}

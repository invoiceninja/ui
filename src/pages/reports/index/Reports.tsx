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
import { useInvoiceFilters } from '$app/pages/invoices/common/hooks/useInvoiceFilters';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { SelectOption } from '$app/components/datatables/Actions';
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import { cloneDeep } from 'lodash';
import { clientMap } from '$app/common/constants/exports/client-map';
import { t } from 'i18next';

type Identifier =
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
  | 'profitloss'
  | 'client_balance_report'
  | 'client_sales_report'
  | 'aged_receivable_detailed_report'
  | 'aged_receivable_summary_report'
  | 'user_sales_report'
  | 'tax_summary_report';

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
  client_id?: string;
  date_range: string;
  report_keys: string[];
  send_email: boolean;
  is_income_billed?: boolean;
  is_expense_billed?: boolean;
  include_tax?: boolean;
  status?: string;
}

const reports: Report[] = [
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
      status: '',
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
  {
    identifier: 'aged_receivable_detailed_report',
    label: 'aged_receivable_detailed_report',
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
  },
  {
    identifier: 'aged_receivable_summary_report',
    label: 'aged_receivable_summary_report',
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
  },
  {
    identifier: 'client_balance_report',
    label: 'client_balance_report',
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
  },
  {
    identifier: 'client_sales_report',
    label: 'client_sales_report',
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
  },
  {
    identifier: 'tax_summary_report',
    label: 'tax_summary_report',
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
  },
  {
    identifier: 'user_sales_report',
    label: 'user_sales_report',
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

  const [report, setReport] = useState<Report>(reports[0]);
  const [isPendingExport, setIsPendingExport] = useState(false);
  const [errors, setErrors] = useState<ValidationBag>();
  const [showCustomColumns, setShowCustomColumns] =useState(false);

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

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={handleExport}
      saveButtonLabel={t('export')}
      disableSaveButton={isPendingExport}
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
          <Element leftSide={`${t('customize')} ${t('columns')}`}>
            <Toggle
              checked={showCustomColumns}
              onValueChange={(value) => setShowCustomColumns(Boolean(value)) }
            />
          </Element>
        </Card>
      </div>

      {showCustomColumns && <TwoColumnsDnd />}
    </Default>
  );
}

export function TwoColumnsDnd() {
  const [data, setData] = useState([
    clientMap,
    [],
  ]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    // Create a copy of the data array
    const $data = cloneDeep(data);

    // Find a source index
    const sourceIndex = parseInt(result.source.droppableId);

    // Find a string
    const word = $data[sourceIndex][result.source.index];

    // Cut a word from the original array
    $data[sourceIndex].splice(result.source.index, 1);

    // Find a destination index
    const destinationIndex = parseInt(result.destination.droppableId);

    // Then we can insert the word into new array at specific index
    $data[destinationIndex].splice(result.destination.index, 0, word);

    setData(() => [...$data]);
  };

  interface Record {
    trans: string;
    value: string;
  }

  return (
    <div className="max-w-3xl">
      <Card className="my-6">
        
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex items-center space-x-4 mx-4">
            <Droppable droppableId="0">
              {(provided) => (
                <div
                  className="w-1/2 border border-dashed flex-column h-screen items-center"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {data[0].map((record: Record, i: number) => (
                    <Draggable
                      key={record.value}
                      draggableId={`left-word-${record.value}`}
                      index={i}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Element key={i}>{t(`${record.trans}`)}</Element>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <Droppable droppableId="1">
              {(provided) => (
                <div
                  className="w-1/2 border border-dashed flex-column h-screen items-center"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {data[1].map((record: Record, i: number) => (
                    <Draggable
                      key={record.value}
                      draggableId={`right-word-${record.value}`}
                      index={i}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Element key={i}>{t(`${record.trans}`)}</Element>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </Card>
    </div>
  );
}

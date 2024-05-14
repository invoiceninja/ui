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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SortableColumns,
  reportColumn,
} from '../common/components/SortableColumns';
import { Identifier, Payload, Report, useReports } from '../common/useReports';
import { usePreferences } from '$app/common/hooks/usePreferences';
import collect from 'collect.js';
import { useQueryClient } from 'react-query';
import { useAtom } from 'jotai';
import {
  Preview,
  PreviewResponse,
  previewAtom,
} from '../common/components/Preview';
import { ProductItemsSelector } from '../common/components/ProductItemsSelector';
import { StatusSelector } from '../common/components/StatusSelector';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdOutlinePreview, MdSchedule } from 'react-icons/md';
import { useScheduleReport } from '../common/hooks/useScheduleReport';
import { useColorScheme } from '$app/common/colors';
import { MultiClientSelector } from '../common/components/MultiClientSelector';
import { MultiExpenseCategorySelector } from '../common/components/MultiExpenseCategorySelector';
import { MultiProjectSelector } from '../common/components/MultiProjectSelector';
import { MultiVendorSelector } from '../common/components/MultiVendorSelector';
import { useShowReportField } from '../common/hooks/useShowReportField';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { ReportsPlanAlert } from '../common/components/ReportsPlanAlert';
interface Range {
  identifier: string;
  label: string;
  scheduleIdentifier: string;
}

export const ranges: Range[] = [
  { identifier: 'all', label: 'all', scheduleIdentifier: 'all' },
  {
    identifier: 'last7',
    label: 'last_7_days',
    scheduleIdentifier: 'last7_days',
  },
  {
    identifier: 'last30',
    label: 'last_30_days',
    scheduleIdentifier: 'last30_days',
  },
  {
    identifier: 'this_month',
    label: 'this_month',
    scheduleIdentifier: 'this_month',
  },
  {
    identifier: 'last_month',
    label: 'last_month',
    scheduleIdentifier: 'last_month',
  },
  {
    identifier: 'this_quarter',
    label: 'this_quarter',
    scheduleIdentifier: 'this_quarter',
  },
  {
    identifier: 'last_quarter',
    label: 'last_quarter',
    scheduleIdentifier: 'last_quarter',
  },
  {
    identifier: 'this_year',
    label: 'this_year',
    scheduleIdentifier: 'this_year',
  },
  { identifier: 'custom', label: 'custom', scheduleIdentifier: 'custom' },
];

const download = (data: BlobPart, identifier: string) => {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.download = `${identifier}.csv`;
  link.href = url;
  link.target = '_blank';

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
};

export default function Reports() {
  const { documentTitle } = useTitle('reports');
  const { t } = useTranslation();

  const reports = useReports();
  const queryClient = useQueryClient();
  const scheduleReport = useScheduleReport();

  const [report, setReport] = useState<Report>(reports[0]);
  const [isPendingExport, setIsPendingExport] = useState(false);
  const [errors, setErrors] = useState<ValidationBag>();
  const [showCustomColumns, setShowCustomColumns] = useState(false);

  const showReportField = useShowReportField({ report: report.identifier });
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

    request('POST', endpoint(report.endpoint), updatedPayload, {})
      .then((response) => {
        if (report.payload.send_email) {
          setIsPendingExport(false);
          return toast.success();
        }

        const hash = response.data.message as string;

        queryClient
          .fetchQuery({
            queryKey: ['exports', hash],
            queryFn: () =>
              request('POST', endpoint(`/api/v1/exports/preview/${hash}`)).then(
                (response) => response.data
              ),
            retry: 50,
            retryDelay: import.meta.env.DEV ? 1000 : 2000,
          })
          .then((response) => {
            download(response, report.identifier);

            toast.success();
          })
          .catch((e) => {
            console.error(e);

            toast.error();
          })
          .finally(() => {
            setIsPendingExport(false);
          });
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
        if (showCustomColumns) {
          save({ silent: true });
        }
      });
  };

  const [preview, setPreview] = useAtom(previewAtom);

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

    request('POST', endpoint(report.preview), updatedPayload, {}).then(
      (response) => {
        const hash = response.data.message as string;

        queryClient
          .fetchQuery<PreviewResponse>({
            queryKey: ['reports', hash],
            queryFn: () =>
              request('POST', endpoint(`/api/v1/reports/preview/${hash}`)).then(
                (response) => response.data
              ),
            retry: 10,
            retryDelay: import.meta.env.DEV ? 1000 : 5000,
          })
          .then((response) => {
            const { columns, ...rows } = response;

            setPreview({ columns, rows: Object.values(rows) });

            toast.success();
          });
      }
    );
  };

  useEffect(() => {
    return () => {
      queryClient.cancelQueries(['reports']);

      toast.dismiss();

      setPreview(null);
    };
  }, []);
  const colors = useColorScheme();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={handleExport}
      saveButtonLabel={t('export')}
      disableSaveButton={isPendingExport || (!proPlan() && !enterprisePlan())}
      navigationTopRight={
        <Dropdown
          label={t('more_actions')}
          disabled={!proPlan() && !enterprisePlan()}
        >
          {report.supports_previews && (
            <DropdownElement
              icon={<Icon element={MdOutlinePreview} />}
              onClick={handlePreview}
            >
              {t('preview')}
            </DropdownElement>
          )}

          <DropdownElement
            icon={<Icon element={MdSchedule} />}
            onClick={() => scheduleReport(report, showCustomColumns)}
          >
            {t('schedule')}
          </DropdownElement>
        </Dropdown>
      }
      withoutBackButton
    >
      <ReportsPlanAlert />

      <div
        className="grid grid-cols-12 gap-4"
        style={{
          color: colors.$3,
          colorScheme: colors.$0,
          backgroundColor: colors.$1,
          borderColor: colors.$4,
        }}
      >
        <Card className="col-span-6 h-max">
          <Element leftSide={t('report')}>
            <SelectField
              onValueChange={(value) => {
                handleReportChange(value as Identifier);
                setPreview(null);
              }}
              value={report.identifier}
              cypressRef="reportNameSelector"
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
              style={{
                color: colors.$3,
                colorScheme: colors.$0,
                backgroundColor: colors.$1,
                borderColor: colors.$4,
              }}
              checked={report.payload.send_email}
              onValueChange={handleSendEmailChange}
            />
          </Element>

          {showReportField('document_email_attachment') && (
            <Element leftSide={t('document_email_attachment')}>
              <Toggle
                style={{
                  color: colors.$3,
                  colorScheme: colors.$0,
                  backgroundColor: colors.$1,
                  borderColor: colors.$4,
                }}
                checked={report.payload.document_email_attachment}
                onValueChange={(value) =>
                  handlePayloadChange('document_email_attachment', value)
                }
                cypressRef="scheduleDocumentEmailAttachment"
              />
            </Element>
          )}

          {showReportField('is_expense_billed') && (
            <Element leftSide={t('expense_paid_report')}>
              <Toggle
                style={{
                  color: colors.$3,
                  colorScheme: colors.$0,
                  backgroundColor: colors.$1,
                  borderColor: colors.$4,
                }}
                checked={report.payload.is_expense_billed}
                onValueChange={(value) =>
                  handlePayloadChange('is_expense_billed', value)
                }
                cypressRef="expenseBilled"
              />
            </Element>
          )}

          {showReportField('is_income_billed') && (
            <Element leftSide={t('cash_vs_accrual')}>
              <Toggle
                style={{
                  color: colors.$3,
                  colorScheme: colors.$0,
                  backgroundColor: colors.$1,
                  borderColor: colors.$4,
                }}
                checked={report.payload.is_income_billed}
                onValueChange={(value) =>
                  handlePayloadChange('is_income_billed', value)
                }
                cypressRef="incomeBilled"
              />
            </Element>
          )}

          {showReportField('include_tax') && (
            <Element leftSide={t('include_tax')}>
              <Toggle
                style={{
                  color: colors.$3,
                  colorScheme: colors.$0,
                  backgroundColor: colors.$1,
                  borderColor: colors.$4,
                }}
                checked={report.payload.include_tax}
                onValueChange={(value) =>
                  handlePayloadChange('include_tax', value)
                }
                cypressRef="includeTax"
              />
            </Element>
          )}

          {showReportField('include_deleted') && (
            <Element
              leftSide={t('include_deleted')}
              leftSideHelp={t('include_deleted_help')}
            >
              <Toggle
                style={{
                  color: colors.$3,
                  colorScheme: colors.$0,
                  backgroundColor: colors.$1,
                  borderColor: colors.$4,
                }}
                checked={report.payload.include_deleted}
                onValueChange={(value) =>
                  handlePayloadChange('include_deleted', value)
                }
                cypressRef="includeDeleted"
              />
            </Element>
          )}

          {showReportField('status') && (
            <Element leftSide={t('status')} className={'mb-50 py-50'}>
              <StatusSelector
                report={report.identifier}
                onValueChange={(statuses) =>
                  handlePayloadChange('status', statuses)
                }
              />
            </Element>
          )}

          {showReportField('product_key') && (
            <ProductItemsSelector
              onValueChange={(productsKeys) =>
                handlePayloadChange('product_key', productsKeys)
              }
            />
          )}

          {showReportField('clients') && (
            <MultiClientSelector
              value={report.payload.clients}
              onValueChange={(clientIds) =>
                handlePayloadChange('clients', clientIds)
              }
            />
          )}

          {showReportField('vendors') && (
            <MultiVendorSelector
              value={report.payload.vendors}
              onValueChange={(vendorIds) =>
                handlePayloadChange('vendors', vendorIds)
              }
            />
          )}

          {showReportField('projects') && (
            <MultiProjectSelector
              value={report.payload.projects}
              onValueChange={(projectIds) =>
                handlePayloadChange('projects', projectIds)
              }
            />
          )}

          {showReportField('categories') && (
            <MultiExpenseCategorySelector
              value={report.payload.categories}
              onValueChange={(expenseCategoryIds) =>
                handlePayloadChange('categories', expenseCategoryIds)
              }
            />
          )}
        </Card>

        <Card className="col-span-6 h-max">
          <Element leftSide={t('range')}>
            <SelectField
              style={{
                color: colors.$3,
                colorScheme: colors.$0,
                backgroundColor: colors.$1,
              }}
              onValueChange={(value) => handleRangeChange(value)}
              value={report.payload.date_range}
              cypressRef="reportDateRange"
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
                cypressRef="reportStartDate"
              />
            </Element>
          )}

          {report.payload.date_range === 'custom' && (
            <Element leftSide={t('end_date')}>
              <InputField
                style={{
                  color: colors.$3,
                  colorScheme: colors.$0,
                  backgroundColor: colors.$1,
                  borderColor: colors.$4,
                }}
                type="date"
                value={report.payload.end_date}
                onValueChange={(value) =>
                  handleCustomDateChange('end_date', value)
                }
                errorMessage={errors?.errors?.end_date}
                cypressRef="reportEndDate"
              />
            </Element>
          )}

          {showReportField('client') && (
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
                style={{
                  color: colors.$3,
                  colorScheme: colors.$0,
                  backgroundColor: colors.$1,
                  borderColor: colors.$4,
                }}
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

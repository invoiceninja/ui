/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Date =
  | 'created_at'
  | 'date'
  | 'due_date'
  | 'partial_due_date'
  | 'payment_date';

type ExportType =
  | 'tasks'
  | 'activities'
  | 'clients'
  | 'client_contacts'
  | 'invoices'
  | 'invoice_items'
  | 'quotes'
  | 'quote_items'
  | 'credits'
  | 'documents'
  | 'expenses'
  | 'purchase_orders'
  | 'purchase_order_items'
  | 'recurring_invoices'
  | 'payments'
  | 'products'
  | 'vendors';

interface Range {
  identifier: string;
  label: string;
}

interface Export {
  date_key: Date;
  date_range: string;
  end_date: string;
  report_keys: string[];
  send_email: boolean;
  start_date: string;
}

const EXPORTS_DATES: Record<ExportType, Date[]> = {
  activities: [],
  clients: ['created_at'],
  client_contacts: ['created_at'],
  invoices: ['date', 'due_date', 'partial_due_date'],
  invoice_items: ['date', 'due_date', 'partial_due_date'],
  quotes: ['date', 'due_date', 'partial_due_date'],
  quote_items: ['date', 'due_date', 'partial_due_date'],
  credits: ['date', 'due_date', 'partial_due_date'],
  documents: ['created_at'],
  expenses: ['date', 'payment_date'],
  purchase_orders: [],
  purchase_order_items: [],
  recurring_invoices: ['date', 'due_date', 'partial_due_date'],
  payments: ['date'],
  products: ['created_at'],
  vendors: [],
  tasks: ['created_at'],
};

const DATE_RANGES: Range[] = [
  {
    identifier: 'last7',
    label: 'last_7_days',
  },
  {
    identifier: 'last30',
    label: 'last_30_days',
  },
  {
    identifier: 'this_month',
    label: 'this_month',
  },
  {
    identifier: 'last_month',
    label: 'last_month',
  },
  {
    identifier: 'this_quarter',
    label: 'this_quarter',
  },
  {
    identifier: 'last_quarter',
    label: 'last_quarter',
  },
  {
    identifier: 'this_year',
    label: 'this_year',
  },
  { identifier: 'custom', label: 'custom' },
];

const DEFAULT_EXPORT: Export = {
  date_key: '' as Date,
  date_range: '',
  end_date: '',
  report_keys: [],
  send_email: true,
  start_date: '',
};
export function Export() {
  const [t] = useTranslation();

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [exportType, setExportType] = useState<ExportType>('activities');
  const [selectedExport, setSelectedExport] = useState<Export>(DEFAULT_EXPORT);

  const handleChange = (
    value: string | Date | boolean,
    property: keyof Export
  ) => {
    if (property === 'date_key') {
      setSelectedExport((current) => ({
        ...current,
        date_key: value as Date,
        date_range: value ? 'last7' : '',
      }));
    } else if (property === 'date_range') {
      setSelectedExport((current) => ({
        ...current,
        date_range: value as string,
        start_date: value === 'custom' ? current.start_date : '',
        end_date: value === 'custom' ? current.end_date : '',
      }));
    } else {
      setSelectedExport((current) => ({
        ...current,
        [property]: value,
      }));
    }
  };

  const handleExport = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint(`/api/v1/reports/${exportType}`), selectedExport)
        .then(() => toast.success('exported_data'))
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    setSelectedExport(DEFAULT_EXPORT);
  }, [exportType]);

  return (
    <Card
      title={t('export')}
      saveButtonLabel={t('export')}
      withSaveButton
      onSaveClick={(event) => {
        event.preventDefault();
        handleExport();
      }}
      disableSubmitButton={isFormBusy}
      disableWithoutIcon
    >
      <Element leftSide={t('export')}>{t('csv')}</Element>

      <Element leftSide={t('export_type')}>
        <SelectField
          value={exportType}
          onValueChange={(value) => setExportType(value as ExportType)}
        >
          {Object.keys(EXPORTS_DATES).map((key, index) => (
            <option key={index} value={key}>
              {t(key)}
            </option>
          ))}
        </SelectField>
      </Element>

      {Boolean(EXPORTS_DATES[exportType].length) && (
        <Element leftSide={t('date')}>
          <SelectField
            value={selectedExport.date_key}
            onValueChange={(value) => handleChange(value, 'date_key')}
            withBlank
            errorMessage={errors?.errors.date_key}
          >
            {EXPORTS_DATES[exportType].map((date, index) => (
              <option key={index} value={date}>
                {t(date)}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      {selectedExport.date_key && (
        <Element leftSide={t('date_range')}>
          <SelectField
            value={selectedExport.date_range}
            onValueChange={(value) => handleChange(value, 'date_range')}
            errorMessage={errors?.errors.date_range}
          >
            {DATE_RANGES.map(({ identifier, label }, index) => (
              <option key={index} value={identifier}>
                {t(label)}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      {selectedExport.date_range === 'custom' && (
        <>
          <Element leftSide={t('start_date')}>
            <InputField
              type="date"
              value={selectedExport.start_date}
              onValueChange={(value) => handleChange(value, 'start_date')}
              errorMessage={errors?.errors.start_date}
            />
          </Element>

          <Element leftSide={t('end_date')}>
            <InputField
              type="date"
              value={selectedExport.end_date}
              onValueChange={(value) => handleChange(value, 'end_date')}
              errorMessage={errors?.errors.end_date}
            />
          </Element>
        </>
      )}
    </Card>
  );
}

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
import { SelectField } from '$app/components/forms';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Date =
  | 'created_at'
  | 'date'
  | 'due_date'
  | 'partial_due_date'
  | 'payment_date';

type ExportType =
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
  | 'tasks'
  | 'profitloss'
  | 'activities'
  | 'aged_receivable_detailed_report'
  | 'aged_receivable_summary_report'
  | 'client_balance_report'
  | 'client_sales_report'
  | 'tax_summary_report'
  | 'user_sales_report';

const EXPORTS_DATES: Record<ExportType, Date[]> = {
  activities: [],
  clients: ['created_at'],
  client_contacts: ['created_at'],
  credits: ['date', 'due_date', 'partial_due_date'],
  documents: ['created_at'],
  expenses: ['date', 'payment_date'],
  invoices: ['date', 'due_date', 'partial_due_date'],
  invoice_items: ['date', 'due_date', 'partial_due_date'],
  quotes: ['date', 'due_date', 'partial_due_date'],
  quote_items: ['date', 'due_date', 'partial_due_date'],
  recurring_invoices: ['date', 'due_date', 'partial_due_date'],
  payments: ['date'],
  products: ['created_at'],
  tasks: ['created_at'],
  profitloss: ['date'],
  aged_receivable_detailed_report: [],
  aged_receivable_summary_report: [],
  client_balance_report: [],
  client_sales_report: [],
  tax_summary_report: [],
  user_sales_report: [],
};
export function Export() {
  const [t] = useTranslation();

  const [exportType, setExportType] = useState<ExportType>('activities');
  const [dateKey, setDateKey] = useState<Date>();

  return (
    <Card withSaveButton saveButtonLabel={t('export')} title={t('export')}>
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
            value={dateKey || ''}
            onValueChange={(value) => setDateKey(value as Date)}
            withBlank
          >
            {EXPORTS_DATES[exportType].map((date, index) => (
              <option key={index} value={date}>
                {t(date)}
              </option>
            ))}
          </SelectField>
        </Element>
      )}
    </Card>
  );
}

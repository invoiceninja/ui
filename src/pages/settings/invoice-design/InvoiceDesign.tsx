/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { Sortable, GeneralSettings } from './components';

export function InvoiceDesign() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'invoice_design'
    )}`;
  });

  return (
    <Settings title={t('invoice_design')}>
      <GeneralSettings />

      <Sortable cardTitle={t('client_details')} />
      <Sortable cardTitle={t('company_details')} />
      <Sortable cardTitle={t('company_address')} />
      <Sortable cardTitle={t('invoice_details')} />
      <Sortable cardTitle={t('quote_details')} />
      <Sortable cardTitle={t('credit_details')} />
      <Sortable cardTitle={t('product_columns')} />
      <Sortable cardTitle={t('task_column')} />
      <Sortable cardTitle={t('total_fields')} />
    </Settings>
  );
}

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
import { Card } from '../../../../components/cards';
import { Settings } from '../../../../components/layouts/Settings';
import { Field } from '../components';

export function Invoices() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('custom_fields')}`;
  });

  return (
    <Settings title={t('custom_fields')}>
      <Card title={`${t('custom_fields')}: ${t('invoices')}`}>
        {['invoice1', 'invoice2', 'invoice3', 'invoice4'].map((field) => (
          <Field field={field} placeholder={t('invoice_field')} />
        ))}
      </Card>

      <Card title={`${t('custom_fields')}: ${t('contacts')}`}>
        {['contact1', 'contact2', 'contact3', 'contact4'].map((field) => (
          <Field field={field} placeholder={t('contact_field')} />
        ))}
      </Card>
    </Settings>
  );
}

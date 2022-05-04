/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../../components/cards';
import { Settings } from '../../../../components/layouts/Settings';
import { Field } from '../components';

export function Clients() {
  const [t] = useTranslation();
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('clients'), href: '/settings/custom_fields/clients' },
  ];
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('custom_fields')}`;
  });

  return (
    <Settings
      title={t('custom_fields')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#custom_fields"
    >
      <Card title={`${t('custom_fields')}: ${t('clients')}`}>
        {['client1', 'client2', 'client3', 'client4'].map((field) => (
          <Field key={field} field={field} placeholder={t('client_field')} />
        ))}
      </Card>

      <Card title={`${t('custom_fields')}: ${t('contacts')}`}>
        {['contact1', 'contact2', 'contact3', 'contact4'].map((field) => (
          <Field key={field} field={field} placeholder={t('contact_field')} />
        ))}
      </Card>
    </Settings>
  );
}

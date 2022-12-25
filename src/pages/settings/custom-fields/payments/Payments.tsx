/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CustomFieldsPlanAlert } from 'components/CustomFieldsPlanAlert';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../../components/cards';
import { Settings } from '../../../../components/layouts/Settings';
import { Field } from '../components';

export function Payments() {
  const [t] = useTranslation();

  const title = `${t('custom_fields')}: ${t('payments')}`;

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('payments'), href: '/settings/custom_fields/payments' },
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
      <CustomFieldsPlanAlert />

      <Card title={title}>
        {['payment1', 'payment2', 'payment3', 'payment4'].map((field) => (
          <Field key={field} field={field} placeholder={t('payment_field')} />
        ))}
      </Card>
    </Settings>
  );
}

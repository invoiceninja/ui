/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { CustomFieldsPlanAlert } from '$app/components/CustomFieldsPlanAlert';
import { Settings } from '$app/components/layouts/Settings';
import { Card } from '$app/components/cards';
import { Field } from '../components';

export function Credits() {
  const { documentTitle } = useTitle('custom_fields');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('credits'), href: '/settings/custom_fields/credits' },
  ];

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      docsLink="en/advanced-settings/#custom_fields"
    >
      <CustomFieldsPlanAlert />

      <Card title={`${t('custom_fields')}: ${t('credits')}`}>
        {['credit1', 'credit2', 'credit3', 'credit4'].map((field) => (
          <Field key={field} field={field} placeholder={t('credit_field')} />
        ))}
      </Card>
    </Settings>
  );
}

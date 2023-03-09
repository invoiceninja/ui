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
import { CustomFieldsPlanAlert } from '$app/components/CustomFieldsPlanAlert';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../../components/cards';
import { Settings } from '../../../../components/layouts/Settings';
import { Field } from '../components';

export function Vendors() {
  const { documentTitle } = useTitle('custom_fields');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('vendors'), href: '/settings/custom_fields/vendors' },
  ];

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#custom_fields"
    >
      <CustomFieldsPlanAlert />

      <Card title={`${t('custom_fields')}: ${t('vendors')}`}>
        {['vendor1', 'vendor2', 'vendor3', 'vendor4'].map((field) => (
          <Field key={field} field={field} placeholder={t('vendor_field')} />
        ))}
      </Card>
    </Settings>
  );
}

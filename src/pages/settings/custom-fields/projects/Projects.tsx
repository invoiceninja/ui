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

export function Projects() {
  const [t] = useTranslation();
  const title = `${t('custom_fields')}: ${t('projects')}`;
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('projects'), href: '/settings/custom_fields/projects' },
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
      <Card title={title}>
        {['project1', 'project2', 'project3', 'project4'].map(
          (field, index) => (
            <Field key={index} field={field} placeholder={t('project_field')} />
          )
        )}
      </Card>
    </Settings>
  );
}

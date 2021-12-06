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

export function Company() {
  const [t] = useTranslation();
  const title = `${t('custom_fields')}: ${t('company')}`;

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('custom_fields')}`;
  });

  return (
    <Settings title={t('custom_fields')}>
      <Card title={title}>
        {['company1', 'company2', 'company3', 'company4'].map((field) => (
          <Field key={field} field={field} placeholder={t('company_field')} />
        ))}
      </Card>
    </Settings>
  );
}

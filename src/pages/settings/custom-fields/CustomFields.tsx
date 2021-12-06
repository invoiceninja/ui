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
import { Card } from '../../../components/cards';
import { Settings } from '../../../components/layouts/Settings';
import { Field } from './components';

export function CustomFields() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('custom_fields')}`;
  });

  return (
    <Settings title={t('custom_fields')}>
      <Card title={t('company')}>
        {['company1', 'company2', 'company3', 'company4'].map((field) => {
          return (
            <Field key={field} id={field} placeholder={t('company_field')} />
          );
        })}
      </Card>
    </Settings>
  );
}

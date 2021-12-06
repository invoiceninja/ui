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

export function Tasks() {
  const [t] = useTranslation();
  const title = `${t('custom_fields')}: ${t('tasks')}`;

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('custom_fields')}`;
  });

  return (
    <Settings title={t('custom_fields')}>
      <Card title={title}>
        {['tasks1', 'tasks2', 'tasks3', 'tasks4'].map((field) => (
          <Field field={field} placeholder={t('tasks_field')} />
        ))}
      </Card>
    </Settings>
  );
}

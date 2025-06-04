/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Field } from '../components/Field';
import { useHandleCustomFieldChange } from '$app/common/hooks/useHandleCustomFieldChange';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';

export function Tasks() {
  useTitle('custom_fields');

  const [t] = useTranslation();

  const company = useCompanyChanges();
  const handleChange = useHandleCustomFieldChange();

  if (!company) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6">
      {['task1', 'task2', 'task3', 'task4'].map((field) => (
        <Field
          key={field}
          field={field}
          placeholder={t('task_field')}
          onChange={(value) => handleChange(field, value)}
          initialValue={company.custom_fields[field]}
          withArrowAsSeparator
        />
      ))}
    </div>
  );
}

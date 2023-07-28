/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CustomFieldsPlanAlert } from '$app/components/CustomFieldsPlanAlert';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Settings } from '$app/components/layouts/Settings';
import { Card } from '$app/components/cards';
import { Field } from '../components/Field';
import { useHandleCustomFieldChange } from '$app/common/hooks/useHandleCustomFieldChange';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useHandleCompanySave } from '../../common/hooks/useHandleCompanySave';

export function Company() {
  useTitle('custom_fields');

  const [t] = useTranslation();

  const title = `${t('custom_fields')}: ${t('company')}`;
  const company = useCurrentCompany();
  const handleChange = useHandleCustomFieldChange();

  return (
    <Card title={title}>
      {['company1', 'company2', 'company3', 'company4'].map((field) => (
        <Field
          key={field}
          field={field}
          placeholder={t('company_field')}
          onChange={(value) => handleChange(field, value)}
          initialValue={company.custom_fields[field]}
        />
      ))}
    </Card>
  );
}

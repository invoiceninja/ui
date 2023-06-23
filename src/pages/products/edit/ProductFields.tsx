/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { useHandleCustomFieldChange } from '$app/common/hooks/useHandleCustomFieldChange';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { CustomFieldsPlanAlert } from '$app/components/CustomFieldsPlanAlert';
import { Field } from '$app/pages/settings/custom-fields/components';
import { useTranslation } from 'react-i18next';

export default function ProductFields() {
  const [t] = useTranslation();

  const company = useInjectCompanyChanges();

  const handleCustomFieldChange = useHandleCustomFieldChange();

  return (
    <>
      <CustomFieldsPlanAlert />

      <Card title={t('custom_fields')}>
        {company &&
          ['product1', 'product2', 'product3', 'product4'].map((field) => (
            <Field
              key={field}
              initialValue={company.custom_fields[field]}
              field={field}
              placeholder={t('product_field')}
              onChange={(value) => handleCustomFieldChange(field, value)}
            />
          ))}
      </Card>
    </>
  );
}

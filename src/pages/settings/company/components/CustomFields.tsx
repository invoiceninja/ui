/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { CustomFieldsPlanAlert } from 'components/CustomFieldsPlanAlert';
import { Field } from 'pages/settings/custom-fields/components';
import { useTranslation } from 'react-i18next';

export function CustomFields() {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const handleCustomFieldChange = useHandleCustomFieldChange();

  return (
    <>
      <CustomFieldsPlanAlert />

      <Card title={t('custom_fields')}>
        <div className="px-6">
          {company &&
            ['company1', 'company2', 'company3', 'company4'].map((field) => (
              <Field
                key={field}
                initialValue={company.custom_fields[field]}
                field={field}
                placeholder={t('company_field')}
                onChange={(value) => handleCustomFieldChange(field, value)}
              />
            ))}
        </div>
      </Card>
    </>
  );
}

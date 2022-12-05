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
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { updateRecord } from 'common/stores/slices/company-users';
import { Field } from 'pages/settings/custom-fields/components';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function CustomFields() {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const company = useInjectCompanyChanges();

  const handleCustomFieldChange = useHandleCustomFieldChange();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const onSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setIsFormBusy(true);

      toast.processing();

      request(
        'PUT',
        endpoint('/api/v1/companies/:id', { id: company?.id }),
        company
      )
        .then((response) => {
          dispatch(
            updateRecord({ object: 'company', data: response.data.data })
          );

          toast.success('updated_user');
        })
        .catch((error: AxiosError) => {
          console.error(error);
          toast.error();
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Card title={t('custom_fields')} withSaveButton onFormSubmit={onSave}>
      <div className="px-6">
        {company &&
          ['user1', 'user2', 'user3', 'user4'].map((field) => (
            <Field
              key={field}
              initialValue={company.custom_fields[field]}
              field={field}
              placeholder={t('user_field')}
              onChange={(value: any) => handleCustomFieldChange(field, value)}
            />
          ))}
      </div>
    </Card>
  );
}

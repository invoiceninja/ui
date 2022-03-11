/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import axios from 'axios';
import { endpoint } from 'common/helpers';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { defaultHeaders } from 'common/queries/common/headers';
import { updateRecord } from 'common/stores/slices/company-users';
import { Field } from 'pages/settings/custom-fields/components';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function PaymentFields() {
  const company = useInjectCompanyChanges();
  const dispatch = useDispatch();

  const [t] = useTranslation();
  const handleCustomFieldChange = useHandleCustomFieldChange();

  const onSave = () => {
    const toastId = toast.loading(t('processing'));

    axios
      .put(endpoint('/api/v1/companies/:id', { id: company.id }), company, {
        headers: defaultHeaders,
      })
      .then((response) => {
        dispatch(
          updateRecord({ object: 'company', data: response?.data.data })
        );

        toast.success(t('updated_payment'), { id: toastId });
      });
  };

  return (
    <Card title={t('custom_fields')} withSaveButton onFormSubmit={onSave}>
      <Element
        leftSide={
          <div className="inline-flex items-center space-x-2">
            <span>{t('note')}</span>
            <span className="text-red-600">*</span>
          </div>
        }
      >
        Custom fields apply to all Payments, they are not specific to this one.
        <i>Needs translation.</i>
      </Element>

      {company &&
        ['payment1', 'payment2', 'payment3', 'payment4'].map((field) => (
          <Field
            key={field}
            initialValue={company.custom_fields[field]}
            field={field}
            placeholder={t('client_field')}
            onChange={(value) => handleCustomFieldChange(field, value)}
          />
        ))}
    </Card>
  );
}

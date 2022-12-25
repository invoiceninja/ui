/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { enterprisePlan } from 'common/guards/guards/enterprise-plan';
import { proPlan } from 'common/guards/guards/pro-plan';
import { endpoint, isHosted } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { updateRecord } from 'common/stores/slices/company-users';
import { CustomFieldsPlanAlert } from 'components/CustomFieldsPlanAlert';
import { Field } from 'pages/settings/custom-fields/components';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function ProductFields() {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const company = useInjectCompanyChanges();

  const handleCustomFieldChange = useHandleCustomFieldChange();

  const disabledCustomFields = !proPlan() && !enterprisePlan() && isHosted();

  const onSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: company?.id }),
      company
    )
      .then((response) => {
        dispatch(
          updateRecord({ object: 'company', data: response?.data.data })
        );

        toast.success('updated_product');
      })
      .catch((error) => {
        console.error(error);
        toast.error();
      });
  };

  return (
    <>
      <CustomFieldsPlanAlert />

      <Card
        title={t('custom_fields')}
        withSaveButton
        onFormSubmit={onSave}
        disableSubmitButton={disabledCustomFields}
        disableWithoutIcon={disabledCustomFields}
      >
        <Element
          leftSide={
            <div className="inline-flex items-center space-x-2">
              <span>{t('note')}</span>
              <span className="text-red-600">*</span>
            </div>
          }
        >
          Custom fields apply to all products, they are not specific to this
          one.
          <i>Needs translation.</i>
        </Element>

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

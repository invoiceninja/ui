/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { defaultHeaders } from 'common/queries/common/headers';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { InputField } from '@invoiceninja/forms';
import { endpoint } from 'common/helpers';
import { Alert } from 'components/Alert';
import { Card, Element } from '@invoiceninja/cards';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { CustomField } from 'components/CustomField';
import { useTitle } from 'common/hooks/useTitle';

export interface CreateProductDto {
  product_key: string;
  notes: string;
  cost: string;
  quantity: number;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
}

interface Props {
  product?: CreateProductDto;
}

export function CreateProduct(props: Props) {
  const [t] = useTranslation();
  const company = useCurrentCompany();

  useTitle(t('new_product'));

  const navigate = useNavigate();

  const [errors, setErrors] = useState<any>();
  
  const formik = useFormik({
    initialValues: {
      product_key: props.product?.product_key || '',
      notes: props.product?.notes || '',
      cost: props.product?.cost || '',
      quantity: props.product?.quantity || 1,
      custom_value1: props.product?.custom_value1 || '',
      custom_value2: props.product?.custom_value2 || '',
      custom_value3: props.product?.custom_value3 || '',
      custom_value4: props.product?.custom_value4 || '',
    },
    onSubmit: (values: CreateProductDto) => {
      axios
        .post(endpoint('/api/v1/products'), values, { headers: defaultHeaders })
        .then((response: AxiosResponse) => {
          toast.success(t('created_product'));

          navigate(
            generatePath('/products/:id/edit', { id: response.data.data.id }),
            { state: { message: t('created_product') } }
          );
        })
        .catch((error: AxiosError) =>
          error.response?.status === 422
            ? setErrors(error.response.data.errors)
            : toast.error(t('error_title'))
        )
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <Card
      title={t('new_product')}
      withSaveButton
      disableSubmitButton={formik.isSubmitting}
      onFormSubmit={formik.handleSubmit}
    >
      <Element leftSide={t('product')} required>
        <InputField
          id="product_key"
          value={formik.initialValues.product_key}
          required
          onChange={formik.handleChange}
        />
        {errors?.product_key && (
          <Alert type="danger">{errors.product_key}</Alert>
        )}
      </Element>
      <Element leftSide={t('notes')}>
        <InputField
          id="notes"
          element="textarea"
          value={formik.initialValues.notes}
          onChange={formik.handleChange}
        />
        {errors?.notes && <Alert type="danger">{errors.notes}</Alert>}
      </Element>
      <Element leftSide={t('cost')}>
        <InputField
          id="cost"
          value={formik.initialValues.cost}
          onChange={formik.handleChange}
        />
        {errors?.cost && <Alert type="danger">{errors.cost}</Alert>}
      </Element>
      <Element leftSide={t('quantity')}>
        <InputField
          id="quantity"
          value={formik.initialValues.quantity}
          onChange={formik.handleChange}
        />
      </Element>
      {company?.custom_fields?.product1 && (
        <CustomField
          field="custom_value1"
          defaultValue={formik.values.custom_value1}
          value={company.custom_fields.product1}
          onChange={(value) => formik.setFieldValue('custom_value1', value)}
        />
      )}

      {company?.custom_fields?.product2 && (
        <CustomField
          field="custom_value2"
          defaultValue={formik.values.custom_value2}
          value={company.custom_fields.product2}
          onChange={(value) => formik.setFieldValue('custom_value2', value)}
        />
      )}

      {company?.custom_fields?.product3 && (
        <CustomField
          field="custom_value3"
          defaultValue={formik.values.custom_value3}
          value={company.custom_fields.product3}
          onChange={(value) => formik.setFieldValue('custom_value3', value)}
        />
      )}

      {company?.custom_fields?.product4 && (
        <CustomField
          field="custom_value4"
          defaultValue={formik.values.custom_value4}
          value={company.custom_fields.product4}
          onChange={(value) => formik.setFieldValue('custom_value4', value)}
        />
      )}
    </Card>
  );
}

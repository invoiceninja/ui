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
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { InputField, Textarea } from '@invoiceninja/forms';
import { endpoint } from 'common/helpers';
import { Default } from 'components/layouts/Default';
import { Container } from 'components/Container';
import { Alert } from 'components/Alert';
import { Card, Element } from '@invoiceninja/cards';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { CustomField } from 'components/CustomField';

export interface CreateProductDto {
  product_key: string;
  notes: string;
  cost: string;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
}

export function Create() {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const pages = [
    { name: t('products'), href: '/products' },
    { name: t('new_product'), href: '/products/create' },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('new_product')}`;
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState<any>();

  const formik = useFormik({
    initialValues: {
      product_key: '',
      notes: '',
      cost: '',
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
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
    <Default breadcrumbs={pages}>
      <Container>
        <Card
          title={t('new_product')}
          withSaveButton
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
        >
          <Element leftSide={t('product')} required>
            <InputField
              id="product_key"
              required
              onChange={formik.handleChange}
            />
            {errors?.product_key && (
              <Alert type="danger">{errors.product_key}</Alert>
            )}
          </Element>
          <Element leftSide={t('notes')}>
            <Textarea id="notes" onChange={formik.handleChange} />
            {errors?.notes && <Alert type="danger">{errors.notes}</Alert>}
          </Element>
          <Element leftSide={t('cost')}>
            <InputField id="cost" onChange={formik.handleChange} />
            {errors?.cost && <Alert type="danger">{errors.cost}</Alert>}
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
      </Container>
    </Default>
  );
}

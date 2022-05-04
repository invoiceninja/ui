/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { defaultHeaders } from 'common/queries/common/headers';
import { useBlankProductQuery } from 'common/queries/products';
import { Modal } from 'components/Modal';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CustomField } from 'components/CustomField';
import { CreateProductDto } from 'pages/products/common/components/CreateProduct';
import { Product } from 'common/interfaces/product';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen?: any;
  onProductCreated?: (product: Product) => unknown;
}

export function ProductCreate(props: Props) {
  const [t] = useTranslation();
  const { data: product } = useBlankProductQuery();

  useTitle(t('new_product'));

  const company = useCurrentCompany();
  const [errors, setErrors] = useState<any>();

  const formik = useFormik({
    initialValues: {
      product_key: product?.data.data.product_key || '',
      notes: product?.data.datanotes || '',
      cost: product?.data.data.cost || '',
      quantity: product?.data.data.quantity || 1,
      tax_name1: product?.data.data.tax_name1 || '',
      tax_name2: product?.data.data.tax_name2 || '',
      tax_name3: product?.data.data.tax_name3 || '',
      tax_rate1: product?.data.data.tax_rate1 || 0,
      tax_rate2: product?.data.data.tax_rate2 || 0,
      tax_rate3: product?.data.data.tax_rate3 || 0,
      custom_value1: product?.data.data.custom_value1 || '',
      custom_value2: product?.data.data.custom_value2 || '',
      custom_value3: product?.data.data.custom_value3 || '',
      custom_value4: product?.data.data.custom_value4 || '',
    },
    onSubmit: (values: CreateProductDto) => {
      axios
        .post(endpoint('/api/v1/products'), values, {
          headers: defaultHeaders(),
        })
        .then((response) => {
          toast.success(t('created_product'));
          props.setIsModalOpen(!props.isModalOpen);

          window.dispatchEvent(
            new CustomEvent('invalidate.combobox.queries', {
              detail: {
                url: endpoint('/api/v1/products'),
              },
            })
          );

          props.onProductCreated && props.onProductCreated(response.data.data);
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
    <Modal
      title={t('new_product')}
      visible={props.isModalOpen}
      onClose={props.setIsModalOpen}
      backgroundColor="gray"
    >
      <InputField
        id="product_key"
        value={formik.initialValues.product_key}
        required
        onChange={formik.handleChange}
        label={t('product')}
        errorMessage={errors?.product_key}
      />

      <InputField
        id="notes"
        element="textarea"
        value={formik.initialValues.notes}
        onChange={formik.handleChange}
        label={t('notes')}
        errorMessage={errors?.notes}
      />

      <InputField
        id="cost"
        value={formik.initialValues.cost}
        onChange={formik.handleChange}
        label={t('cost')}
        errorMessage={errors?.cost}
      />

      <InputField
        id="quantity"
        value={formik.initialValues.quantity}
        onChange={formik.handleChange}
        label={t('quantity')}
        errorMessage={errors?.quantity}
      />

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

      <Button
        type="primary"
        behavior="button"
        onClick={() => formik.submitForm()}
      >
        {t('save')}
      </Button>
    </Modal>
  );
}

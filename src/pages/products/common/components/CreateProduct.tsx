/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { InputField } from '@invoiceninja/forms';
import { endpoint } from 'common/helpers';
import { Card, Element } from '@invoiceninja/cards';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { CustomField } from 'components/CustomField';
import { useTitle } from 'common/hooks/useTitle';
import { TaxRateSelector } from 'components/tax-rates/TaxRateSelector';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import Toggle from 'components/forms/Toggle';

export interface CreateProductDto {
  product_key: string;
  notes: string;
  cost: number;
  quantity: number;
  in_stock_quantity: number;
  stock_notification_threshold: number;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
  tax_rate1: number;
  tax_name1: string;
  tax_rate2: number;
  tax_name2: string;
  tax_rate3: number;
  tax_name3: string;
  price: number;
}

interface Props {
  product?: CreateProductDto;
}

export function CreateProduct(props: Props) {
  const [t] = useTranslation();

  useTitle(t('new_product'));

  const company = useCurrentCompany();

  const navigate = useNavigate();

  const [errors, setErrors] = useState<any>();

  const [stockNotification, setStockNotification] = useState(false);

  const formik = useFormik({
    initialValues: {
      product_key: props.product?.product_key || '',
      notes: props.product?.notes || '',
      cost: props.product?.cost || 0,
      quantity: props.product?.quantity || 1,
      in_stock_quantity: props.product?.in_stock_quantity || 0,
      stock_notification_threshold:
        props.product?.stock_notification_threshold || 0,
      custom_value1: props.product?.custom_value1 || '',
      custom_value2: props.product?.custom_value2 || '',
      custom_value3: props.product?.custom_value3 || '',
      custom_value4: props.product?.custom_value4 || '',
      tax_name1: props.product?.tax_name1 || '',
      tax_rate1: props.product?.tax_rate1 || 0,
      tax_name2: props.product?.tax_name2 || '',
      tax_rate2: props.product?.tax_rate2 || 0,
      tax_name3: props.product?.tax_name3 || '',
      tax_rate3: props.product?.tax_rate3 || 0,
      price: props.product?.price || 0,
    },
    onSubmit: (values: CreateProductDto) => {
      request('POST', endpoint('/api/v1/products'), {
        ...values,
        stock_notification: stockNotification,
      })
        .then((response: AxiosResponse) => {
          toast.success(t('created_product'));

          navigate(
            route('/products/:id/edit', {
              id: response.data.data.id,
            }),
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
          errorMessage={errors?.product_key}
        />
      </Element>

      <Element leftSide={t('notes')}>
        <InputField
          id="notes"
          element="textarea"
          value={formik.initialValues.notes}
          onChange={formik.handleChange}
          errorMessage={errors?.notes}
        />
      </Element>

      <Element leftSide={t('price')}>
        <InputField
          id="price"
          value={formik.values.price}
          onChange={formik.handleChange}
          errorMessage={errors?.price}
        />
      </Element>

      {company?.enable_product_cost && (
        <Element leftSide={t('cost')}>
          <InputField
            id="cost"
            value={formik.initialValues.cost}
            onChange={formik.handleChange}
            errorMessage={errors?.cost}
          />
        </Element>
      )}

      {company?.enable_product_quantity && (
        <Element leftSide={t('quantity')}>
          <InputField
            id="quantity"
            value={formik.initialValues.quantity}
            onChange={formik.handleChange}
            errorMessage={errors?.quantity}
          />
        </Element>
      )}

      {company?.track_inventory && (
        <>
          <Element leftSide={t('stock_quantity')}>
            <InputField
              id="in_stock_quantity"
              value={formik.initialValues.in_stock_quantity}
              onChange={formik.handleChange}
              errorMessage={errors?.in_stock_quantity}
            />
          </Element>
          <Element leftSide={t('stock_notifications')}>
            <Toggle
              checked={stockNotification}
              onChange={setStockNotification}
            />
          </Element>
          <Element leftSide={t('notification_threshold')}>
            <InputField
              id="stock_notification_threshold"
              value={formik.initialValues.stock_notification_threshold}
              onChange={formik.handleChange}
              errorMessage={errors?.stock_notification_threshold}
            />
          </Element>
        </>
      )}

      {company && company.enabled_item_tax_rates > 0 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            onChange={(value) => {
              formik.setFieldValue('tax_rate1', value.resource?.rate);
              formik.setFieldValue('tax_name1', value.resource?.name);
            }}
            defaultValue={formik.values.tax_rate1}
            clearButton={Boolean(formik.values.tax_rate1)}
            onClearButtonClick={() => {
              formik.setFieldValue('tax_rate1', 0);
              formik.setFieldValue('tax_name1', '');
            }}
            onTaxCreated={(taxRate) => {
              formik.setFieldValue('tax_rate1', taxRate.rate);
              formik.setFieldValue('tax_name1', taxRate.name);
            }}
          />
        </Element>
      )}

      {company && company.enabled_item_tax_rates > 1 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            onChange={(value) => {
              formik.setFieldValue('tax_rate2', value.resource?.rate);
              formik.setFieldValue('tax_name2', value.resource?.name);
            }}
            defaultValue={formik.values.tax_rate2}
            clearButton={Boolean(formik.values.tax_rate2)}
            onClearButtonClick={() => {
              formik.setFieldValue('tax_rate2', 0);
              formik.setFieldValue('tax_name2', '');
            }}
            onTaxCreated={(taxRate) => {
              formik.setFieldValue('tax_rate2', taxRate.rate);
              formik.setFieldValue('tax_name2', taxRate.name);
            }}
          />
        </Element>
      )}

      {company && company.enabled_item_tax_rates > 2 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            onChange={(value) => {
              formik.setFieldValue('tax_rate3', value.resource?.rate);
              formik.setFieldValue('tax_name3', value.resource?.name);
            }}
            defaultValue={formik.values.tax_rate3}
            clearButton={Boolean(formik.values.tax_rate3)}
            onClearButtonClick={() => {
              formik.setFieldValue('tax_rate3', 0);
              formik.setFieldValue('tax_name3', '');
            }}
            onTaxCreated={(taxRate) => {
              formik.setFieldValue('tax_rate3', taxRate.rate);
              formik.setFieldValue('tax_name3', taxRate.name);
            }}
          />
        </Element>
      )}

      {company?.custom_fields?.product1 && (
        <CustomField
          field="custom_value1"
          defaultValue={formik.values.custom_value1}
          value={company.custom_fields.product1}
          onValueChange={(value) =>
            formik.setFieldValue('custom_value1', value)
          }
        />
      )}

      {company?.custom_fields?.product2 && (
        <CustomField
          field="custom_value2"
          defaultValue={formik.values.custom_value2}
          value={company.custom_fields.product2}
          onValueChange={(value) =>
            formik.setFieldValue('custom_value2', value)
          }
        />
      )}

      {company?.custom_fields?.product3 && (
        <CustomField
          field="custom_value3"
          defaultValue={formik.values.custom_value3}
          value={company.custom_fields.product3}
          onValueChange={(value) =>
            formik.setFieldValue('custom_value3', value)
          }
        />
      )}

      {company?.custom_fields?.product4 && (
        <CustomField
          field="custom_value4"
          defaultValue={formik.values.custom_value4}
          value={company.custom_fields.product4}
          onValueChange={(value) =>
            formik.setFieldValue('custom_value4', value)
          }
        />
      )}
    </Card>
  );
}

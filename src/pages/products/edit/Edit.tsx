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
import { InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { EntityState } from 'common/enums/entity-state';
import { endpoint, getEntityState } from 'common/helpers';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { bulk, useProductQuery } from 'common/queries/products';
import { CustomField } from 'components/CustomField';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { EntityStatus } from 'components/EntityStatus';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import { TaxRateSelector } from 'components/tax-rates/TaxRateSelector';
import { request } from 'common/helpers/request';

export function Edit() {
  const { id } = useParams();
  const { data: product } = useProductQuery({ id });

  const queryClient = useQueryClient();

  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();

  const company = useCurrentCompany();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      product_key: product?.data.data.product_key || '',
      notes: product?.data.data.notes || '',
      cost: product?.data.data.cost || 0,
      quantity: product?.data.data.quantity || 1,
      tax_name1: product?.data.data.tax_name1 || '',
      tax_rate1: product?.data.data.tax_rate1 || 0,
      tax_name2: product?.data.data.tax_name2 || '',
      tax_rate2: product?.data.data.tax_rate2 || 0,
      tax_name3: product?.data.data.tax_name3 || '',
      tax_rate3: product?.data.data.tax_rate3 || 0,
      price: product?.data.data.price || 0,
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);

      request('PUT', endpoint('/api/v1/products/:id', { id }), values)
        .then(() => toast.success(t('updated_product'), { id: toastId }))
        .catch((error: AxiosError) => {
          console.error(error);

          toast.error(t('error_title'), { id: toastId });

          if (error.response?.status === 422) {
            setErrors(error.response.data);
          }
        })
        .finally(() => {
          formik.setSubmitting(false);

          queryClient.invalidateQueries(
            generatePath('/api/v1/products/:id', { id })
          );
        });
    },
  });

  const handleResourcefulAction = (
    action: 'archive' | 'restore' | 'delete',
    id: string
  ) => {
    const toastId = toast.loading(t('processing'));

    bulk([id], action)
      .then(() => toast.success(t(`${action}d_product`), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() =>
        queryClient.invalidateQueries(
          generatePath('/api/v1/products/:id', { id })
        )
      );
  };

  return (
    <>
      {product && (
        <Card
          title={product.data.data.product_key || t('edit_product')}
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          withSaveButton
        >
          <Element leftSide={t('status')}>
            <EntityStatus entity={product.data.data} />
          </Element>

          <Element leftSide={t('product')}>
            <InputField
              id="product_key"
              value={formik.values.product_key}
              onChange={formik.handleChange}
              errorMessage={errors?.errors.product_key}
            />
          </Element>

          <Element leftSide={t('description')}>
            <InputField
              id="notes"
              element="textarea"
              value={formik.values.notes}
              onChange={formik.handleChange}
              errorMessage={errors?.errors.description}
            />
          </Element>

          <Element leftSide={t('price')}>
            <InputField
              id="price"
              value={formik.values.price}
              onChange={formik.handleChange}
              errorMessage={errors?.errors.price}
            />
          </Element>

          {company?.enable_product_cost && (
            <Element leftSide={t('cost')}>
              <InputField
                id="cost"
                value={formik.values.cost}
                onChange={formik.handleChange}
                errorMessage={errors?.errors.cost}
              />
            </Element>
          )}

          {company?.enable_product_quantity && (
            <Element leftSide={t('quantity')}>
              <InputField
                id="quantity"
                value={formik.values.quantity}
                onChange={formik.handleChange}
                errorMessage={errors?.errors.quantity}
              />
            </Element>
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
              defaultValue={product?.data.data.custom_value1}
              value={company.custom_fields.product1}
              onChange={(value) => formik.setFieldValue('custom_value1', value)}
            />
          )}
          {company?.custom_fields?.product2 && (
            <CustomField
              field="custom_value2"
              defaultValue={product?.data.data.custom_value2}
              value={company.custom_fields.product2}
              onChange={(value) => formik.setFieldValue('custom_value2', value)}
            />
          )}

          {company?.custom_fields?.product3 && (
            <CustomField
              field="custom_value3"
              defaultValue={product?.data.data.custom_value3}
              value={company.custom_fields.product3}
              onChange={(value) => formik.setFieldValue('custom_value3', value)}
            />
          )}

          {company?.custom_fields?.product4 && (
            <CustomField
              field="custom_value4"
              defaultValue={product?.data.data.custom_value4}
              value={company.custom_fields.product4}
              onChange={(value) => formik.setFieldValue('custom_value4', value)}
            />
          )}
        </Card>
      )}

      {product && (
        <div className="flex justify-end">
          <Dropdown label={t('more_actions')}>
            <DropdownElement to={generatePath('/products/:id/clone', { id })}>
              {t('clone_product')}
            </DropdownElement>

            {getEntityState(product.data.data) === EntityState.Active && (
              <DropdownElement
                onClick={() =>
                  handleResourcefulAction('archive', product.data.data.id)
                }
              >
                {t('archive_product')}
              </DropdownElement>
            )}

            {(getEntityState(product.data.data) === EntityState.Archived ||
              getEntityState(product.data.data) === EntityState.Deleted) && (
              <DropdownElement
                onClick={() =>
                  handleResourcefulAction('restore', product.data.data.id)
                }
              >
                {t('restore_product')}
              </DropdownElement>
            )}

            {(getEntityState(product.data.data) === EntityState.Active ||
              getEntityState(product.data.data) === EntityState.Archived) && (
              <DropdownElement
                onClick={() =>
                  handleResourcefulAction('delete', product.data.data.id)
                }
              >
                {t('delete_product')}
              </DropdownElement>
            )}
          </Dropdown>
        </div>
      )}
    </>
  );
}

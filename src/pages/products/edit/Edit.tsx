/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { EntityState } from 'common/enums/entity-state';
import { endpoint, getEntityState } from 'common/helpers';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { defaultHeaders } from 'common/queries/common/headers';
import { useProductQuery } from 'common/queries/products';
import { EntityStatus } from 'components/EntityStatus';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import { Archive } from './components/Archive';
import { Delete } from './components/Delete';
import { Restore } from './components/Restore';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: product } = useProductQuery({ id });
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<ValidationBag>();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      product_key: product?.data.data.product_key || '',
      notes: product?.data.data.notes || '',
      cost: product?.data.data.cost || 0,
      quantity: product?.data.data.quantity || 1,
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);

      axios
        .put(endpoint('/api/v1/products/:id', { id }), values, {
          headers: defaultHeaders,
        })
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

  return (
    <>
      {product && (
        <Card
          title={product.data.data.product_key}
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
              value={formik.values.cost}
              onChange={formik.handleChange}
              errorMessage={errors?.errors.price}
            />
          </Element>

          <Element leftSide={t('default_quantity')}>
            <InputField
              type="number"
              id="quantity"
              value={formik.values.quantity}
              onChange={formik.handleChange}
              errorMessage={errors?.errors.quantity}
            />
          </Element>
        </Card>
      )}

      {product && getEntityState(product.data.data) === EntityState.Active && (
        <Archive
          id={product.data.data.id}
          endpoint={generatePath('/api/v1/products/:id', { id })}
        />
      )}

      {product &&
        (getEntityState(product.data.data) === EntityState.Archived ||
          getEntityState(product.data.data) === EntityState.Deleted) && (
          <Restore
            id={product.data.data.id}
            endpoint={generatePath('/api/v1/products/:id', { id })}
          />
        )}

      {product && getEntityState(product.data.data) === EntityState.Active && (
        <Delete
          id={product.data.data.id}
          endpoint={generatePath('/api/v1/products/:id', { id })}
        />
      )}
    </>
  );
}

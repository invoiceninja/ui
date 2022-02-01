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
import { bulk, useProductQuery } from 'common/queries/products';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { EntityStatus } from 'components/EntityStatus';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';

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

      {product && (
        <div className="flex justify-center">
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

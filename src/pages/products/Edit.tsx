/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect, useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router';
import { endpoint, request } from '../../common/helpers';
import { bulk, useProductQuery } from '../../common/queries/products';
import { Alert } from '../../components/Alert';
import { Container } from '../../components/Container';
import { Button } from '../../components/forms/Button';
import { InputField } from '../../components/forms/InputField';
import { Textarea } from '../../components/forms/Textarea';
import { Default } from '../../components/layouts/Default';
import { Spinner } from '../../components/Spinner';
import { Badge } from '../../components/Badge';
import { useSWRConfig } from 'swr';

interface UpdateProductDto {
  product_key: string;
  notes: string;
  cost: string;
}

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState<any>();
  const { data, error } = useProductQuery({ id });
  const [errors, setErrors] = useState<any>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState<
    { type: string; message: string } | undefined
  >(undefined);
  const { mutate } = useSWRConfig();

  const [initialValues, setInitialValues] = useState<UpdateProductDto>({
    product_key: '',
    notes: '',
    cost: '',
  });

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${
      data?.data.data.product_key
    }`;

    let product = data?.data.data;

    setInitialValues({
      product_key: product?.product_key,
      notes: product?.notes,
      cost: product?.cost,
    });

    if (location?.state?.message) {
      setAlert({ type: 'success', message: location?.state?.message });
    }

    setProduct(product);
  }, [data, location]);

  const form = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit: (values: UpdateProductDto) => {
      setIsFormBusy(true);
      setErrors('');
      setAlert(undefined);

      request('PUT', endpoint('/api/v1/products/:id', { id }), values, {
        'X-Api-Token': localStorage.getItem('X-NINJA-TOKEN'),
      })
        .then((response: AxiosResponse) => {
          setAlert({
            type: 'success',
            message: t('updated_product'),
          });

          mutate(data?.request.responseURL);
        })
        .catch((error: AxiosError) => {
          if (error.response?.status === 403) {
            return navigate('/logout');
          }

          if (error.response?.status === 422) {
            setErrors(error.response.data.errors);
          }

          setAlert({
            type: 'error',
            message: error?.response?.data.message,
          });
        })
        .finally(() => setIsFormBusy(false));
    },
  });

  function archive() {
    bulk([product.id], 'archive')
      .then((response: AxiosResponse) => mutate(data?.request.responseURL))
      .catch((error: AxiosError) =>
        setAlert({ type: 'danger', message: error.request?.data.message })
      );
  }

  function restore() {
    bulk([product.id], 'restore')
      .then((response: AxiosResponse) => mutate(data?.request.responseURL))
      .catch((error: AxiosError) =>
        setAlert({ type: 'danger', message: error.request?.data.message })
      );
  }

  function _delete() {
    if (!confirm(t('are_you_sure'))) {
      return;
    }

    bulk([product.id], 'delete')
      .then((response: AxiosResponse) => mutate(data?.request.responseURL))
      .catch((error: AxiosError) =>
        setAlert({ type: 'danger', message: error.request?.data.message })
      );
  }

  if (!data || !product) {
    return (
      <Default>
        <Container>
          <div className="flex justify-center">
            <Spinner />
          </div>
        </Container>
      </Default>
    );
  }

  return (
    <Default>
      <Container>
        {alert && (
          <Alert className="mb-4" type={alert.type}>
            {alert.message}.
          </Alert>
        )}

        <h2 className="inline-flex items-end text-2xl space-x-2">
          <span>{data.data.data.product_key}</span>

          {!product.is_deleted && !product.archived_at && (
            <Badge variant="white">{t('active')}</Badge>
          )}

          {product.archived_at && !product.is_deleted ? (
            <Badge variant="yellow">{t('archived')}</Badge>
          ) : null}

          {product.is_deleted && <Badge variant="red">{t('deleted')}</Badge>}
        </h2>
        <div className="bg-white w-full p-8 rounded shadow my-4">
          <form onSubmit={form.handleSubmit} className="space-y-6">
            <InputField
              label={t('product')}
              id="product_key"
              required
              value={form.values.product_key || ''}
              onChange={form.handleChange}
            />

            {errors?.product_key && (
              <Alert type="danger">{errors.product_key}</Alert>
            )}

            <Textarea
              label={t('notes')}
              id="notes"
              onChange={form.handleChange}
              value={form.values.notes || ''}
            />

            {errors?.notes && <Alert type="danger">{errors.notes}</Alert>}

            <InputField
              label={t('cost')}
              id="cost"
              value={form.values.cost || ''}
              onChange={form.handleChange}
            />

            {errors?.cost && <Alert type="danger">{errors.cost}</Alert>}

            <div className="flex justify-end items-center space-x-2">
              {!isFormBusy && (
                <Button to="/products" type="secondary">
                  {t('cancel')}
                </Button>
              )}

              <Button disabled={isFormBusy}>{t('save')}</Button>
            </div>
          </form>
        </div>

        {/* Cloning product */}
        <div className="mt-2 bg-white w-full p-8 rounded shadow my-4">
          <div className="flex items-start justify-between">
            <section>
              <h2>{t('clone_product')}</h2>
              <span className="text-xs text-gray-600">
                Lorem, ipsum dolor. Lorem ipsum dolor sit amet.
              </span>
            </section>
            <Button
              to={generatePath('/products/:id/clone', {
                id: product?.id,
              })}
            >
              {t('clone')}
            </Button>
          </div>
        </div>

        {/* Archiving product */}
        {!product.is_deleted && !product.archived_at ? (
          <div className="mt-2 bg-white w-full p-8 rounded shadow my-4">
            <div className="flex items-start justify-between">
              <section>
                <h2>{t('archive_product')}</h2>
                <span className="text-xs text-gray-600">
                  Lorem, ipsum dolor. Lorem ipsum dolor sit amet.
                </span>
              </section>
              <Button onClick={archive}>{t('archive')}</Button>
            </div>
          </div>
        ) : null}

        {/* Restoring product */}
        {product.archived_at ? (
          <div className="mt-2 bg-white w-full p-8 rounded shadow my-4">
            <div className="flex items-start justify-between">
              <section>
                <h2>{t('restore_product')}</h2>
                <span className="text-xs text-gray-600">
                  Lorem, ipsum dolor. Lorem ipsum dolor sit amet.
                </span>
              </section>
              <Button onClick={restore}>{t('restore')}</Button>
            </div>
          </div>
        ) : null}

        {/* Deleting product */}
        {!product.is_deleted ? (
          <div className="mt-2 bg-white w-full p-8 rounded shadow my-4">
            <div className="flex items-start justify-between">
              <section>
                <h2>{t('delete_product')}</h2>
                <span className="text-xs text-gray-600">
                  Lorem, ipsum dolor. Lorem ipsum dolor sit amet.
                </span>
              </section>
              <Button onClick={_delete}>{t('delete')}</Button>
            </div>
          </div>
        ) : null}
      </Container>
    </Default>
  );
}

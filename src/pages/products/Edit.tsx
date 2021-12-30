/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router';
import { endpoint } from '../../common/helpers';
import { bulk, useProductQuery } from '../../common/queries/products';
import { Alert } from '../../components/Alert';
import { Container } from '../../components/Container';
import { Button } from '../../components/forms/Button';
import { InputField } from '../../components/forms/InputField';
import { Textarea } from '../../components/forms/Textarea';
import { Default } from '../../components/layouts/Default';
import { Spinner } from '../../components/Spinner';
import { Badge } from '../../components/Badge';
import { useQueryClient } from 'react-query';
import { defaultHeaders } from 'common/queries/common/headers';
import toast from 'react-hot-toast';
import { Breadcrumbs } from 'components/Breadcrumbs';

interface UpdateProductDto {
  product_key: string;
  notes: string;
  cost: string;
}

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();

  const pages = [
    { name: t('products'), href: '/products' },
    {
      name: t('edit_product'),
      href: generatePath('/products/:id/edit', { id }),
    },
  ];

  const { data, isLoading } = useProductQuery({ id });
  const [errors, setErrors] = useState<any>();
  const [alert, setAlert] = useState<
    { type: string; message: string } | undefined
  >(undefined);

  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${
      data?.data.data.product_key
    }`;
  }, [data]);

  const invalidateProductCache = () => {
    queryClient.invalidateQueries(generatePath('/api/v1/products/:id', { id }));
  };

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      product_key: data?.data.data.product_key || '',
      notes: data?.data.data.notes || '',
      cost: data?.data.data.cost || 0,
    },
    onSubmit: (values: UpdateProductDto) => {
      setErrors('');
      setAlert(undefined);

      axios
        .put(endpoint('/api/v1/products/:id', { id }), values, {
          headers: defaultHeaders,
        })
        .then(() => toast.success(t('updated_product')))
        .catch((error) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data.errors);
          }

          setAlert({
            type: 'error',
            message: error?.response?.data.message,
          });
        })
        .finally(() => {
          form.setSubmitting(false);
          invalidateProductCache();
        });
    },
  });

  const archive = () => {
    bulk([id as string], 'archive')
      .then(() => invalidateProductCache())
      .catch((error) =>
        setAlert({ type: 'danger', message: error.request?.data.message })
      );
  };

  function restore() {
    bulk([id as string], 'restore')
      .then(() => invalidateProductCache())
      .catch((error) =>
        setAlert({ type: 'danger', message: error.request?.data.message })
      );
  }

  function _delete() {
    if (!confirm(t('are_you_sure'))) {
      return;
    }

    bulk([id as string], 'delete')
      .then(() => invalidateProductCache())
      .catch((error) =>
        setAlert({ type: 'danger', message: error.request?.data.message })
      );
  }

  if (isLoading) {
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
        <Breadcrumbs pages={pages} />

        {alert && (
          <Alert className="mb-4" type={alert.type}>
            {alert.message}.
          </Alert>
        )}

        <h2 className="inline-flex items-end text-2xl space-x-2">
          <span>{data?.data.data.product_key}</span>

          {!data?.data.data.is_deleted && !data?.data.data.archived_at && (
            <Badge variant="white">{t('active')}</Badge>
          )}

          {data?.data.data.archived_at && !data?.data.data.is_deleted ? (
            <Badge variant="yellow">{t('archived')}</Badge>
          ) : null}

          {data?.data.data.is_deleted && (
            <Badge variant="red">{t('deleted')}</Badge>
          )}
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
              {!form.isSubmitting && (
                <Button to="/products" type="secondary">
                  {t('cancel')}
                </Button>
              )}

              <Button disabled={form.isSubmitting}>{t('save')}</Button>
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
                id,
              })}
            >
              {t('clone')}
            </Button>
          </div>
        </div>

        {/* Archiving product */}
        {!data?.data.data.is_deleted && !data?.data.data.archived_at ? (
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
        {data?.data.data.archived_at ? (
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
        {!data?.data.data.is_deleted ? (
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

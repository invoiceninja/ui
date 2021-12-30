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
import { endpoint } from '../../common/helpers';
import { Alert } from '../../components/Alert';
import { Container } from '../../components/Container';
import { Default } from '../../components/layouts/Default';
import { Button, InputField, Textarea } from '@invoiceninja/forms';
import { Breadcrumbs } from 'components/Breadcrumbs';

export interface CreateProductDto {
  product_key: string;
  notes: string;
  cost: string;
}

export function Create() {
  const [t] = useTranslation();

  const pages = [
    { name: t('products'), href: '/products' },
    { name: t('new_product'), href: '/products/create' },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('new_product')}`;
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState<any>();

  const form = useFormik({
    initialValues: {
      product_key: '',
      notes: '',
      cost: '',
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
        .finally(() => form.setSubmitting(false));
    },
  });

  return (
    <Default>
      <Container>
        <Breadcrumbs pages={pages} />

        <h2 className="text-2xl">{t('new_product')}</h2>
        <div className="bg-white w-full p-8 rounded shadow my-4">
          <form onSubmit={form.handleSubmit} className="space-y-6">
            <InputField
              label={t('product')}
              id="product_key"
              required
              onChange={form.handleChange}
            />

            {errors?.product_key && (
              <Alert type="danger">{errors.product_key}</Alert>
            )}

            <Textarea
              label={t('notes')}
              id="notes"
              onChange={form.handleChange}
            />

            {errors?.notes && <Alert type="danger">{errors.notes}</Alert>}

            <InputField
              label={t('cost')}
              id="cost"
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
      </Container>
    </Default>
  );
}

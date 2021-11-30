/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { endpoint, request } from '../../common/helpers';
import { Alert } from '../../components/Alert';
import { Container } from '../../components/Container';
import { Button } from '../../components/forms/Button';
import { InputField } from '../../components/forms/InputField';
import { Textarea } from '../../components/forms/Textarea';
import { Default } from '../../components/layouts/Default';

export interface CreateProductDto {
  product_key: string;
  notes: string;
  cost: string;
}

export function Create() {
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('new_product')}`;
  });

  const [t] = useTranslation();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState<string>('');
  const [errors, setErrors] = useState<any>();

  const form = useFormik({
    initialValues: {
      product_key: '',
      notes: '',
      cost: '',
    },
    onSubmit: (values: CreateProductDto) => {
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/products'), values, {
        'X-Api-Token': localStorage.getItem('X-NINJA-TOKEN'),
      })
        .then((response: AxiosResponse) =>
          navigate(
            generatePath('/products/:id/edit', { id: response.data.data.id }),
            { state: { message: t('created_product') } }
          )
        )
        .catch((error: AxiosError) => {
          if (error.response?.status === 403) {
            return navigate('/logout');
          }

          if (error.response?.status === 422) {
            setErrors(error.response.data.errors);
          }

          setAlert(error?.response?.data.message);
        })
        .finally(() => setIsFormBusy(false));
    },
  });

  return (
    <Default>
      <Container>
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
              {!isFormBusy && (
                <Button to="/products" type="secondary">
                  {t('cancel')}
                </Button>
              )}

              <Button disabled={isFormBusy}>{t('save')}</Button>
            </div>
          </form>
        </div>
      </Container>
    </Default>
  );
}

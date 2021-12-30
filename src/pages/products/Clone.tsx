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
import { Breadcrumbs } from 'components/Breadcrumbs';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';
import { endpoint, request } from '../../common/helpers';
import { useProductQuery } from '../../common/queries/products';
import { Alert } from '../../components/Alert';
import { Container } from '../../components/Container';
import { Button } from '../../components/forms/Button';
import { InputField } from '../../components/forms/InputField';
import { Textarea } from '../../components/forms/Textarea';
import { Default } from '../../components/layouts/Default';
import { Spinner } from '../../components/Spinner';
import { CreateProductDto } from './Create';

export function Clone() {
  const [t] = useTranslation();
  const { id } = useParams();

  const pages = [
    { name: t('products'), href: '/products' },
    {
      name: t('clone_product'),
      href: generatePath('/products/:id/clone', { id }),
    },
  ];

  const { data } = useProductQuery({ id });
  const [errors, setErrors] = useState<any>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState<
    { type: string; message: string } | undefined
  >(undefined);

  const [initialValues, setInitialValues] = useState<CreateProductDto>({
    product_key: '',
    notes: '',
    cost: '',
  });

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${
      data?.data.data.product_key
    }`;

    setInitialValues({
      product_key: data?.data.data.product_key,
      notes: data?.data.data.notes,
      cost: data?.data.data.cost,
    });
  }, [data, location]);

  const form = useFormik({
    enableReinitialize: true,
    initialValues,
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

  if (!data) {
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

        <h2 className="text-2xl">
          {t('clone')}: {data.data.data.product_key}
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
        {alert && <Alert type={alert?.type}>{alert?.message}.</Alert>}
      </Container>
    </Default>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer, Element } from '@invoiceninja/cards';
import { InputField, InputLabel } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { useExpenseCategoryQuery } from 'common/queries/expense-categories';
import { Badge } from 'components/Badge';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import { Archive } from './components/edit/Archive';
import { Delete } from './components/edit/Delete';
import { Restore } from './components/edit/Restore';

export function Edit() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const { id } = useParams();
  const { data } = useExpenseCategoryQuery({ id });

  const [errors, setErrors] = useState<Record<string, any>>({});

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${
      data?.data.data.name
    }`;
  }, [data]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.data.data.name || '',
      color: data?.data.data.color || '',
    },
    onSubmit: (values) => {
      setErrors({});
      toast.loading(t('processing'));

      axios
        .put(endpoint('/api/v1/expense_categories/:id', { id }), values, {
          headers: defaultHeaders(),
        })
        .then(() => {
          toast.dismiss();
          toast.success(t('updated_expense_category'));
        })
        .catch((error: AxiosError) => {
          toast.dismiss();

          error.response?.status === 422
            ? setErrors(error.response?.data)
            : toast.error(t('error_title'));
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries(
            generatePath('/api/v1/expense_categories/:id', { id })
          );
        });
    },
  });

  return (
    <Settings title={t('expense_categories')}>
      {!data && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {data && (
        <Container className="space-y-6">
          <Card
            withSaveButton
            disableSubmitButton={formik.isSubmitting}
            onFormSubmit={formik.handleSubmit}
            title={data.data.data.name}
          >
            <Element leftSide={t('status')}>
              {!data.data.data.is_deleted && !data.data.data.archived_at && (
                <Badge variant="primary">{t('active')}</Badge>
              )}

              {data.data.data.archived_at && !data.data.data.is_deleted ? (
                <Badge variant="yellow">{t('archived')}</Badge>
              ) : null}

              {data.data.data.is_deleted && (
                <Badge variant="red">{t('deleted')}</Badge>
              )}
            </Element>

            <CardContainer>
              <InputField
                id="name"
                label={t('name')}
                onChange={formik.handleChange}
                value={formik.values.name}
                errorMessage={errors?.errors?.name}
                required
              />

              <InputLabel>{t('color')}</InputLabel>
              <input
                type="color"
                id="color"
                onChange={formik.handleChange}
                value={formik.values.color}
              />
            </CardContainer>
          </Card>

          <Archive />
          <Restore />
          <Delete />
        </Container>
      )}
    </Settings>
  );
}

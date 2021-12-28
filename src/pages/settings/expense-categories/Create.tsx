/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer } from '@invoiceninja/cards';
import { InputField, InputLabel } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';

export function Create() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<Record<string, any>>({});

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'create_expense_category'
    )}`;
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      color: '',
    },
    onSubmit: (values) => {
      setErrors({});
      toast.loading(t('processing'));

      axios
        .post(endpoint('/api/v1/expense_categories'), values, {
          headers: defaultHeaders,
        })
        .then((response) => {
          toast.dismiss();
          toast.success(t('created_expense_category'));

          navigate(
            generatePath('/settings/expense_categories/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError) => {
          toast.dismiss();

          error.response?.status === 422
            ? setErrors(error.response?.data)
            : toast.error(t('error_title'));
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <Settings title={t('expense_categories')}>
      <Container>
        <Card
          withSaveButton
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          title={t('create_expense_category')}
        >
          <CardContainer>
            <InputField
              id="name"
              label={t('name')}
              onChange={formik.handleChange}
              errorMessage={errors?.errors?.name}
              required
            />

            <InputLabel>{t('color')}</InputLabel>
            <input type="color" id="color" onChange={formik.handleChange} />
          </CardContainer>
        </Card>
      </Container>
    </Settings>
  );
}

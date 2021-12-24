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
import { InputField } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate } from 'react-router-dom';

export function Create() {
  const [t] = useTranslation();
  const [errors, setErrors] = useState<any>(undefined);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'create_tax_rate'
    )}`;
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      rate: '',
    },
    onSubmit: (values) => {
      setErrors(undefined);

      axios
        .post(endpoint('/api/v1/tax_rates'), values, {
          headers: defaultHeaders,
        })
        .then((response) => {
          toast.success(t('created_tax_rate'));

          queryClient.invalidateQueries('/api/v1/payment_terms');

          navigate(
            generatePath('/settings/tax_rates/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError) => {
          console.error(error);

          error.response?.status === 422
            ? setErrors(error.response.data)
            : toast.error(t('error_title'));
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <Settings title={t('tax_rates')}>
      <Container className="space-y-6">
        <Card
          withSaveButton
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          title={t('create_tax_rate')}
        >
          <CardContainer>
            <InputField
              type="text"
              id="name"
              label={t('name')}
              errorMessage={errors?.errors.name}
              onChange={formik.handleChange}
              required
            />

            <InputField
              type="text"
              id="rate"
              label={t('rate')}
              errorMessage={errors?.errors.rate}
              onChange={formik.handleChange}
              required
            />
          </CardContainer>
        </Card>
      </Container>
    </Settings>
  );
}

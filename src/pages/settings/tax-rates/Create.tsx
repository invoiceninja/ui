/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export function Create() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tax_settings'), href: '/settings/tax_settings' },
    { name: t('create_tax_rate'), href: '/settings/tax_rates/create' },
  ];

  const [errors, setErrors] = useState<Record<string, any>>({});
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
      setErrors({});

      request('POST', endpoint('/api/v1/tax_rates'), values)
        .then((response) => {
          toast.success(t('created_tax_rate'));

          queryClient.invalidateQueries('/api/v1/payment_terms');

          navigate(
            route('/settings/tax_rates/:id/edit', {
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
        <Breadcrumbs pages={pages} />

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
              errorMessage={errors?.errors?.name}
              onChange={formik.handleChange}
              required
            />

            <InputField
              type="text"
              id="rate"
              label={t('rate')}
              errorMessage={errors?.errors?.rate}
              onChange={formik.handleChange}
              required
            />
          </CardContainer>
        </Card>
      </Container>
    </Settings>
  );
}

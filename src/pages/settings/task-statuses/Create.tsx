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
import { InputField, InputLabel } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { Breadcrumbs } from 'components/Breadcrumbs';
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

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('task_settings'), href: '/settings/task_settings' },
    { name: t('new_task_status'), href: '/settings/task_statuses/create' },
  ];

  const [errors, setErrors] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'new_task_status'
    )}`;
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      color: '',
    },
    onSubmit: (values) => {
      setErrors({});

      axios
        .post(endpoint('/api/v1/task_statuses'), values, {
          headers: defaultHeaders(),
        })
        .then((response) => {
          toast.dismiss();
          toast.success(t('created_task_status'));

          queryClient.invalidateQueries('/api/v1/task_statuses');

          navigate(
            generatePath('/settings/task_statuses/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError) => {
          toast.dismiss();
          console.error(error);

          error.response?.status === 422
            ? setErrors(error.response.data)
            : toast.error(t('error_title'));
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <Settings title={t('task_statuses')}>
      <Container className="space-y-6">
        <Breadcrumbs pages={pages} />

        <Card
          withSaveButton
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          title={t('new_task_status')}
        >
          <CardContainer>
            <InputField
              type="text"
              id="name"
              label={t('name')}
              errorMessage={errors?.errors?.name}
              required
              onChange={formik.handleChange}
            />

            <InputLabel>{t('color')}</InputLabel>
            <input type="color" id="color" onChange={formik.handleChange} />
          </CardContainer>
        </Card>
      </Container>
    </Settings>
  );
}

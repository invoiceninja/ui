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
import { useTaskStatusQuery } from 'common/queries/task-statuses';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data } = useTaskStatusQuery({ id });

  const [errors, setErrors] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${
      data?.data.data.name
    }`;
  }, [data]);

  const invalidateTaskStatusCache = () => {
    queryClient.invalidateQueries(
      generatePath('/api/v1/task_statuses/:id', { id })
    );
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.data.data.name || '',
      color: data?.data.data.color || '',
    },
    onSubmit: (values) => {
      setErrors({});

      axios
        .put(endpoint('/api/v1/task_statuses/:id', { id }), values, {
          headers: defaultHeaders,
        })
        .then(() => {
          toast.dismiss();
          toast.success(t('updated_task_status'));
        })
        .catch((error: AxiosError) => {
          console.error(error);
          toast.dismiss();

          error.response?.status === 422
            ? setErrors(error.response.data)
            : toast.error(t('error_title'));
        })
        .finally(() => {
          formik.setSubmitting(false);
          invalidateTaskStatusCache();
        });
    },
  });

  return (
    <Settings title={t('task_statuses')}>
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
            title={data?.data.data.name}
          >
            <CardContainer>
              <InputField
                type="text"
                id="name"
                label={t('name')}
                errorMessage={errors?.errors?.name}
                onChange={formik.handleChange}
                value={formik.values.name}
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
        </Container>
      )}
    </Settings>
  );
}

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
import { Breadcrumbs } from 'components/Breadcrumbs';
import { useTranslation } from 'react-i18next';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { InputField } from '@invoiceninja/forms';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { generatePath, useParams } from 'react-router-dom';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { useApiTokenQuery } from 'common/queries/api-tokens';
import { useQueryClient } from 'react-query';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data } = useApiTokenQuery({ id });

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_tokens'), href: '/settings/integrations/api_tokens' },
    {
      name: t('edit_token'),
      href: generatePath('/settings/integrations/api_tokens/:id/edit', { id }),
    },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('new_token')}`;
  });

  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState(false);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.data?.data.name || '',
    },
    onSubmit: (values) => {
      setErrors({});
      const toastId = toast.loading(t('processing'));

      axios
        .put(endpoint('/api/v1/tokens/:id', { id }), values, {
          headers: { 'X-Api-Password': password, ...defaultHeaders },
        })
        .then(() => {
          toast.success(t('updated_token'), { id: toastId });
        })
        .catch((error: AxiosError) => {
          if (error.response?.status === 412) {
            return toast.error(error.response.data.message, { id: toastId });
          }

          if (error.response?.status === 422) {
            toast.dismiss();

            return setErrors(error.response.data);
          }

          return toast.error(t('error_title'), { id: toastId });
        })
        .finally(() => {
          formik.setSubmitting(false);
          
          queryClient.invalidateQueries(
            generatePath('/api/v1/tokens/:id', { id })
          );
        });
    },
  });

  return (
    <>
      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={(password) => {
          setPassword(password);
          formik.submitForm();
        }}
      />

      <Settings title={t('new_token')}>
        <Container className="space-y-6">
          <Breadcrumbs pages={pages} />

          <Card
            disableSubmitButton={formik.isSubmitting}
            onFormSubmit={(event) => {
              event.preventDefault();
              setIsPasswordConfirmModalOpen(true);
            }}
            withSaveButton
            title={data?.data?.data.name}
          >
            <CardContainer>
              <InputField
                required
                label={t('name')}
                id="name"
                onChange={formik.handleChange}
                errorMessage={errors?.errors?.name}
                value={formik.values.name}
              />
            </CardContainer>
          </Card>
        </Container>
      </Settings>
    </>
  );
}

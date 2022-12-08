/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';
import { Settings } from 'components/layouts/Settings';
import { InputField } from '@invoiceninja/forms';
import { useState } from 'react';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useNavigate } from 'react-router-dom';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { useTitle } from 'common/hooks/useTitle';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { ValidationBag } from 'common/interfaces/validation-bag';

export function Create() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_tokens'), href: '/settings/integrations/api_tokens' },
    {
      name: t('new_token'),
      href: '/settings/integrations/api_tokens/create',
    },
  ];

  useTitle('new_token');

  const navigate = useNavigate();
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState(false);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, any>>({});

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    onSubmit: (values) => {
      setErrors({});
      const toastId = toast.loading(t('processing'));

      request('POST', endpoint('/api/v1/tokens'), values, {
        headers: { 'X-Api-Password': password },
      })
        .then((response) => {
          toast.success(t('created_token'), { id: toastId });

          navigate(
            route('/settings/integrations/api_tokens/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          formik.setSubmitting(false);

          if (error.response?.status === 422) {
            toast.dismiss();

            return setErrors(error.response.data);
          }

          error.response?.status === 412
            ? toast.error(t('password_error_incorrect'), { id: toastId })
            : toast.error(t('error_title'), { id: toastId });
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

      <Settings title={t('new_token')} breadcrumbs={pages}>
        <Card
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={(event) => {
            event.preventDefault();
            setIsPasswordConfirmModalOpen(true);
          }}
          withSaveButton
          title={t('new_token')}
        >
          <Element leftSide={t('name')}>
            <InputField
              required
              id="name"
              onChange={formik.handleChange}
              errorMessage={errors?.errors?.name}
            />
          </Element>
        </Card>
      </Settings>
    </>
  );
}

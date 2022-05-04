/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect, useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { ForgotPasswordForm } from '../../common/dtos/authentication';
import { endpoint, isHosted, request } from '../../common/helpers';
import { ForgotPasswordValidation } from './common/ValidationInterface';
import { InputField } from '../../components/forms/InputField';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/forms/Button';
import { HostedLinks } from './components/HostedLinks';
import { Link } from '../../components/forms/Link';
import { Header } from './components/Header';

interface Response {
  message: string;
  status: boolean;
}

export function RecoverPassword() {
  const [t] = useTranslation();
  const [isFormBusy, setIsFormBusy] = useState(false);
  const [message, setMessage] = useState<Response | undefined>(undefined);
  const [errors, setErrors] = useState<ForgotPasswordValidation | undefined>(
    undefined
  );

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'recover_password'
    )}`;
  });

  const form = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: (values: ForgotPasswordForm) => {
      setIsFormBusy(true);
      setErrors(undefined);
      setMessage(undefined);

      request('POST', endpoint('/api/v1/reset_password'), values)
        .then((response: AxiosResponse) => setMessage(response.data))
        .catch((error: AxiosError) => {
          return error.response?.status === 422
            ? setErrors(error.response?.data.errors)
            : setMessage(error.response?.data);
        })
        .finally(() => setIsFormBusy(false));
    },
  });

  return (
    <div className="h-screen md:bg-gray-100">
      <Header />

      <div className="flex flex-col items-center">
        <div className="bg-white mx-4 max-w-md w-full p-8 rounded md:shadow-lg">
          <h2 className="text-2xl">{t('recover_password')}</h2>

          <form onSubmit={form.handleSubmit} className="my-6">
            <InputField
              type="email"
              label={t('email_address')}
              id="email"
              onChange={form.handleChange}
            />

            {errors?.email && (
              <Alert className="mt-2" type="danger">
                {errors.email}
              </Alert>
            )}

            {message && (
              <Alert
                className="mt-4"
                type={message.status ? 'success' : 'danger'}
              >
                {message.message}
              </Alert>
            )}

            <Button disabled={isFormBusy} className="mt-4" variant="block">
              {t('send_email')}
            </Button>
          </form>

          <div className="flex justify-center">
            {isHosted() && <Link to="/login">{t('login')}</Link>}
          </div>
        </div>

        {isHosted() && (
          <div className="bg-white mx-4 max-w-md w-full rounded md:shadow-lg mt-4">
            <HostedLinks />
          </div>
        )}
      </div>
    </div>
  );
}

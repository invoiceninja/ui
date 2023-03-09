/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useFormik } from 'formik';
import { LoginForm } from '../../common/dtos/authentication';
import { endpoint, isHosted } from '../../common/helpers';
import { AxiosError } from 'axios';
import { LoginValidation } from './common/ValidationInterface';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/forms/Button';
import { Link } from '../../components/forms/Link';
import { InputLabel } from '../../components/forms/InputLabel';
import { Alert } from '../../components/Alert';
import { HostedLinks } from './components/HostedLinks';
import { Header } from './components/Header';
import { useTitle } from '$app/common/hooks/useTitle';
import { request } from '$app/common/helpers/request';
import { SignInProviders } from './components/SignInProviders';
import { useLogin } from './common/hooks';
import { GenericValidationBag } from '$app/common/interfaces/validation-bag';

export function Login() {
  useTitle('login');

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<LoginValidation | undefined>(undefined);
  const [isFormBusy, setIsFormBusy] = useState(false);
  const [t] = useTranslation();

  const login = useLogin();

  const form = useFormik({
    initialValues: {
      email: '',
      password: '',
      one_time_password: '',
    },
    onSubmit: (values: LoginForm) => {
      setMessage(undefined);
      setErrors(undefined);
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/login'), values)
        .then((response) => login(response))
        .catch((error: AxiosError<GenericValidationBag<LoginValidation>>) => {
          return error.response?.status === 422
            ? setErrors(error.response.data.errors)
            : setMessage(
                error.response?.data.message ??
                  (t('invalid_credentials') as string)
              );
        })
        .finally(() => setIsFormBusy(false));
    },
  });

  return (
    <div className="h-screen md:bg-gray-100">
      <Header />
      <div className="flex flex-col items-center">
        <div className="bg-white mx-4 max-w-md w-full p-8 rounded md:shadow-lg">
          <h2 className="text-2xl">{t('login')}</h2>

          <form onSubmit={form.handleSubmit} className="my-6 space-y-4">
            <InputField
              type="email"
              label={t('email_address')}
              id="email"
              onChange={form.handleChange}
              errorMessage={errors?.email}
            />

            <InputField
              type="password"
              label={t('password')}
              id="password"
              onChange={form.handleChange}
              errorMessage={errors?.password}
            />

            <div className="space-y-2">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <InputLabel>{`2FA - ${t('one_time_password')}`}</InputLabel>
                <Link to="/recover_password">{t('forgot_password')}</Link>
              </div>
            </div>

            <InputField
              type="text"
              id="one_time_password"
              onChange={form.handleChange}
              placeholder={t('plaid_optional')}
              errorMessage={errors?.one_time_password}
            />

            {message && (
              <Alert className="mt-4" type="danger">
                {message}
              </Alert>
            )}

            <Button disabled={isFormBusy} className="mt-4" variant="block">
              {t('login')}
            </Button>
          </form>

          <div className="flex justify-center">
            {isHosted() && <Link to="/register">{t('register_label')}</Link>}
          </div>
        </div>

        {isHosted() && (
          <>
            <SignInProviders />

            <div className="bg-white mx-4 max-w-md w-full rounded md:shadow-lg mt-4">
              <HostedLinks />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

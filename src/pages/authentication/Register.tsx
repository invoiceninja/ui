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
import { AxiosError, AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { RegisterForm } from '../../common/dtos/authentication';
import { endpoint, isHosted } from '../../common/helpers';
import { register } from '../../common/stores/slices/user';
import { RegisterValidation } from './common/ValidationInterface';
import { Header } from './components/Header';
import { InputField } from '../../components/forms/InputField';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/forms/Button';
import { HostedLinks } from './components/HostedLinks';
import { Link } from '../../components/forms/Link';
import { request } from '$app/common/helpers/request';
import { SignInProviders } from './components/SignInProviders';
import { GenericValidationBag } from '$app/common/interfaces/validation-bag';
import {
  changeCurrentIndex,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { useTitle } from '$app/common/hooks/useTitle';

export function Register() {
  useTitle('register');

  const [t] = useTranslation();

  const [errors, setErrors] = useState<RegisterValidation | undefined>(
    undefined
  );

  const [isFormBusy, setIsFormBusy] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();

  const form = useFormik({
    initialValues: {
      email: '',
      password: '',
      password_confirmation: '',
      terms_of_service: false,
      privacy_policy: false,
    },
    onSubmit(values: RegisterForm) {
      setMessage('');
      setErrors(undefined);
      setIsFormBusy(true);

      if (values.password !== values.password_confirmation) {
        setIsFormBusy(false);

        setErrors({
          password_confirmation: ['Password confirmation does not match.'],
        });

        return;
      }

      request(
        'POST',
        endpoint(
          '/api/v1/signup?include=token,user.company_user,company,account'
        ),
        values
      )
        .then((response: AxiosResponse) => {
          dispatch(
            register({
              token: response.data.data[0].token.token,
              user: response.data.data[0].user,
            })
          );

          dispatch(updateCompanyUsers(response.data.data));
          dispatch(changeCurrentIndex(0));
        })
        .catch(
          (error: AxiosError<GenericValidationBag<RegisterValidation>>) => {
            if (error.response?.status === 422) {
              setErrors(error.response.data.errors);
            }

            setMessage(error.response?.data.message as string);
            setIsFormBusy(false);
          }
        );
    },
  });

  return (
    <div className="h-screen md:bg-gray-100">
      <Header />
      <div className="flex flex-col items-center">
        <div className="bg-white mx-4 max-w-md w-full p-8 rounded md:shadow-lg">
          <h2 className="text-2xl">{t('register_label')}</h2>

          <form onSubmit={form.handleSubmit} className="my-6">
            <section>
              <InputField
                type="email"
                autoComplete="on"
                label={t('email_address')}
                id="email"
                onChange={form.handleChange}
              />

              {errors?.email && (
                <Alert className="mt-2" type="danger">
                  {errors.email}
                </Alert>
              )}
            </section>

            <section className="mt-4">
              <InputField
                type="password"
                autoComplete="on"
                label={t('password')}
                id="password"
                onChange={form.handleChange}
              />

              {errors?.password && (
                <Alert className="mt-2" type="danger">
                  {errors.password}
                </Alert>
              )}
            </section>

            <section className="mt-4">
              <InputField
                type="password"
                autoComplete="on"
                label={t('password_confirmation')}
                id="password_confirmation"
                onChange={form.handleChange}
              />

              {errors?.password_confirmation && (
                <Alert className="mt-2" type="danger">
                  {errors.password_confirmation}
                </Alert>
              )}
            </section>

            {message && (
              <Alert className="mt-4" type="danger">
                {message}
              </Alert>
            )}

            <Button disabled={isFormBusy} className="mt-4" variant="block">
              {t('register')}
            </Button>
          </form>

          <div className="flex justify-center">
            {isHosted() && <Link to="/login">{t('login')}</Link>}
          </div>
        </div>

        {
          <>
            <div className="bg-white mx-4 max-w-md w-full rounded md:shadow-lg mt-4">
              <SignInProviders />
            </div>

            <div className="bg-white mx-4 max-w-md w-full rounded md:shadow-lg mt-4">
              <HostedLinks />
            </div>
          </>
        }
      </div>
    </div>
  );
}

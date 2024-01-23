/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { RegisterForm } from '../../common/dtos/authentication';
import { apiEndpoint, isHosted } from '../../common/helpers';
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
import { useColorScheme } from '$app/common/colors';
import { useSearchParams } from 'react-router-dom';
import { TurnstileWidget } from './components/TurnstileWidget';
import { useTurnstile } from 'react-turnstile';

export function Register() {
  useTitle('register');

  const [t] = useTranslation();

  const turnstile = useTurnstile();

  const [errors, setErrors] = useState<RegisterValidation | undefined>(
    undefined
  );

  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [isTurnstileVisible, setIsTrunstileVisible] = useState<boolean>(false);

  const [isFormBusy, setIsFormBusy] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();

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

      const endpoint = new URL(
        '/api/v1/signup?include=token,user.company_user,company,account',
        apiEndpoint()
      );

      [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
      ].forEach((key) => {
        if (searchParams.has(key)) {
          endpoint.searchParams.append(key, searchParams.get(key) as string);
        }
      });

      request('POST', endpoint.href, {
        ...values,
        ['cf-turnstile']: turnstileToken,
      })
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
        )
        .finally(() => {
          turnstile.reset();
          setIsTrunstileVisible(false);
          setTurnstileToken('');
        });
    },
  });

  const colors = useColorScheme();

  useEffect(() => {
    if (turnstileToken) {
      form.handleSubmit();
    }
  }, [turnstileToken]);

  return (
    <>
      <div className="h-screen">
        <Header />

        <div className="flex flex-col items-center">
          <div
            className="mx-4 max-w-md w-full p-8 rounded md:shadow-lg border"
            style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
          >
            <h2 className="text-2xl" style={{ color: colors.$3 }}>
              {t('register_label')}
            </h2>

            <div className="space-y-5 my-6">
              <InputField
                type="email"
                autoComplete="on"
                label={t('email_address')}
                id="email"
                onChange={form.handleChange}
                errorMessage={errors?.email}
              />

              <InputField
                type="password"
                autoComplete="on"
                label={t('password')}
                id="password"
                onChange={form.handleChange}
                errorMessage={errors?.password}
              />

              <InputField
                type="password"
                autoComplete="on"
                label={t('password_confirmation')}
                id="password_confirmation"
                onChange={form.handleChange}
                errorMessage={errors?.password_confirmation}
              />

              {message && (
                <Alert className="mt-4" type="danger">
                  {message}
                </Alert>
              )}

              {isTurnstileVisible && (
                <div className="flex justify-center">
                  <TurnstileWidget
                    onVerified={(token) => setTurnstileToken(token)}
                  />
                </div>
              )}

              <Button
                disabled={isFormBusy}
                className="mt-4"
                variant="block"
                onClick={() => setIsTrunstileVisible(true)}
              >
                {t('register')}
              </Button>
            </div>

            <div className="flex justify-center">
              {isHosted() && <Link to="/login">{t('login')}</Link>}
            </div>
          </div>

          {
            <>
              <SignInProviders />

              <div className="mx-4 max-w-md w-full rounded md:shadow-lg mt-4">
                <HostedLinks />
              </div>
            </>
          }
        </div>
      </div>
    </>
  );
}

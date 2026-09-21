/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTurnstile } from 'react-turnstile';
import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { useTitle } from '$app/common/hooks/useTitle';
import { GenericValidationBag } from '$app/common/interfaces/validation-bag';
import {
  changeCurrentIndex,
  resetChanges,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { RegisterForm } from '../../common/dtos/authentication';
import { apiEndpoint, isHosted } from '../../common/helpers';
import { register } from '../../common/stores/slices/user';
import { Button } from '../../components/forms/Button';
import { InputField } from '../../components/forms/InputField';
import { Link } from '../../components/forms/Link';
import { RegisterValidation } from './common/ValidationInterface';
import { Header } from './components/Header';
import { HostedLinks } from './components/HostedLinks';
import { OrDivider } from './components/OrDivider';
import { SignInProviders } from './components/SignInProviders';
import { TurnstileWidget } from './components/TurnstileWidget';

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

  const formRef = useRef<HTMLFormElement>(null);

  const resetTurnstile = () => {
    turnstile.reset();
    setIsTrunstileVisible(false);
    setTurnstileToken('');
  };

  const handleRegister = (form: HTMLFormElement) => {
    const formData = new FormData(form);

    const values: RegisterForm = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      password_confirmation: formData.get('password_confirmation') as string,
      terms_of_service: false,
      privacy_policy: false,
    };

    setMessage('');
    setErrors(undefined);

    if (values.password !== values.password_confirmation) {
      setIsFormBusy(false);

      setErrors({
        password_confirmation: ['Password confirmation does not match.'],
      });

      resetTurnstile();

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

    const rc = searchParams.get('rc');

    if (rc) {
      endpoint.searchParams.append('rc', rc as string);
    }

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
        dispatch(resetChanges('company'));
        dispatch(changeCurrentIndex(0));
      })
      .catch((error: AxiosError<GenericValidationBag<RegisterValidation>>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);
        }

        setMessage(error.response?.data.message as string);
        setIsFormBusy(false);
      })
      .finally(() => resetTurnstile());
  };

  const colors = useColorScheme();

  useEffect(() => {
    if (turnstileToken && formRef.current) {
      handleRegister(formRef.current);
    }
  }, [turnstileToken]);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center py-8">
        <Header />

        <div className="flex flex-col items-center w-full">
          <div
            className="mx-4 max-w-md w-full p-8 rounded md:shadow-lg border"
            style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
          >
            <h2 className="text-2xl" style={{ color: colors.$3 }}>
              {t('register_label')}
            </h2>

            <form
              ref={formRef}
              onSubmit={(event) => {
                event.preventDefault();
                setIsFormBusy(true);
                setIsTrunstileVisible(true);
              }}
              className="space-y-5 my-6"
            >
              <InputField
                type="email"
                autoComplete="username"
                label={t('email_address')}
                id="email"
                name="email"
                errorMessage={errors?.email}
              />

              <InputField
                type="password"
                autoComplete="new-password"
                label={t('password')}
                id="password"
                name="password"
                errorMessage={errors?.password}
              />

              <InputField
                type="password"
                autoComplete="new-password"
                label={t('password_confirmation')}
                id="password_confirmation"
                name="password_confirmation"
                errorMessage={errors?.password_confirmation}
              />

              <ErrorMessage className="mt-4">{message}</ErrorMessage>

              {isTurnstileVisible && (
                <div className="flex justify-center">
                  <TurnstileWidget
                    onVerified={(token) => setTurnstileToken(token)}
                  />
                </div>
              )}

              <Button disabled={isFormBusy} className="mt-4" variant="block">
                {t('register')}
              </Button>
            </form>

            <div className="mb-6 space-y-6">
              <OrDivider />

              <SignInProviders />
            </div>

            <div className="flex justify-center">
              {isHosted() && <Link to="/login">{t('login')}</Link>}
            </div>
          </div>

          <div className="mx-4 max-w-md w-full rounded md:shadow-lg mt-4">
            <HostedLinks />
          </div>
        </div>
      </div>
    </>
  );
}

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
import { endpoint, isHosted, isSelfHosted } from '../../common/helpers';
import { AxiosError } from 'axios';
import { LoginValidation } from './common/ValidationInterface';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/forms/Button';
import { Link } from '../../components/forms/Link';
import { InputLabel } from '../../components/forms/InputLabel';
import { HostedLinks } from './components/HostedLinks';
import { Header } from './components/Header';
import { useTitle } from '$app/common/hooks/useTitle';
import { request } from '$app/common/helpers/request';
import { SignInProviders } from './components/SignInProviders';
import { useCheckUserState, useLogin } from './common/hooks';
import { GenericValidationBag } from '$app/common/interfaces/validation-bag';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Disable2faModal } from './components/Disable2faModal';
import { useColorScheme } from '$app/common/colors';
import { version } from '$app/common/helpers/version';
import { toast } from '$app/common/helpers/toast/toast';
import classNames from 'classnames';
import { ErrorMessage } from '$app/components/ErrorMessage';

type Step = 'email' | 'credentials';

export function Login() {
  useTitle('login');

  const accentColor = useAccentColor();

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<LoginValidation | undefined>(undefined);
  const [isFormBusy, setIsFormBusy] = useState(false);
  const [t] = useTranslation();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [oneTimePassword, setOneTimePassword] = useState<string>('');
  const [hasTwoFactor, setHasTwoFactor] = useState<boolean>(false);

  const [isDisable2faModalOpen, setIsDisable2faModalOpen] =
    useState<boolean>(false);

  const login = useLogin();
  const checkUserState = useCheckUserState();

  function handleContinue() {
    setMessage(undefined);
    setErrors(undefined);

    if (!email) {
      setErrors({ email: [t('email_is_invalid') as string] });
      return;
    }

    setIsFormBusy(true);

    checkUserState(email)
      .then((state) => {
        setHasTwoFactor(Boolean(state.has_two_factor));
        setStep('credentials');
      })
      .catch((error: AxiosError<GenericValidationBag<LoginValidation>>) => {
        if (error.code === 'ERR_NETWORK') {
          return;
        }

        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);

          if (error.response.data.message) {
            setMessage(error.response.data.message);
          }
        } else {
          setMessage(
            error.response?.data.message ?? (t('error_refresh_page') as string)
          );
        }
      })
      .finally(() => setIsFormBusy(false));
  }

  function handleLogin(form: HTMLFormElement) {
    const formData = new FormData(form);

    setMessage(undefined);
    setErrors(undefined);
    setIsFormBusy(true);

    const secret = formData.get('secret') as string;

    request('POST', endpoint('/api/v1/login'), Object.fromEntries(formData), {
      ...(secret && {
        headers: { 'X-API-SECRET': secret },
      }),
    })
      .then((response) => login(response))
      .catch((error: AxiosError<GenericValidationBag<LoginValidation>>) => {
        if (error.code === 'ERR_NETWORK') {
          return;
        }

        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);

          if (error.response.data.message) {
            setMessage(error.response.data.message);
          }
        } else if (error.response?.status === 503) {
          toast.error('app_maintenance');
        } else {
          setMessage(
            error.response?.data.message ?? (t('error_refresh_page') as string)
          );
        }
      })
      .finally(() => setIsFormBusy(false));
  }

  function handleBackToEmail() {
    setMessage(undefined);
    setErrors(undefined);
    setPassword('');
    setOneTimePassword('');
    setHasTwoFactor(false);
    setStep('email');
  }

  const colors = useColorScheme();

  const isEmailStep = step === 'email';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8">
      <Header />

      <div className="flex flex-col items-center w-full">
        <div
          className="mx-4 max-w-md w-full p-8 rounded md:shadow-lg border"
          style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
        >
          <h2 className="text-2xl" style={{ color: colors.$3 }}>
            {t('login')}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (isEmailStep) {
                handleContinue();
              } else {
                handleLogin(e.currentTarget);
              }
            }}
            className="my-6 space-y-4"
          >
            <div className={classNames({ hidden: !isEmailStep })}>
              <InputField
                type="email"
                autoComplete="username"
                label={t('email_address')}
                errorMessage={errors?.email}
                name="email"
                value={email}
                onValueChange={(value) => setEmail(value)}
                changeOverride
              />
            </div>

            {!isEmailStep && (
              <>
                <div
                  className="flex items-center justify-between rounded px-3 py-2 border"
                  style={{ borderColor: colors.$5 }}
                >
                  <span
                    className="truncate text-sm"
                    style={{ color: colors.$3 }}
                  >
                    {email}
                  </span>

                  <div
                    className="text-sm hover:underline cursor-pointer shrink-0 ml-3"
                    onClick={handleBackToEmail}
                    style={{ color: accentColor }}
                  >
                    {t('change')}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-x-3">
                    <InputLabel className="truncate">
                      {t('password')}
                    </InputLabel>

                    <Link className="truncate" to="/recover_password">
                      {t('forgot_password')}
                    </Link>
                  </div>
                </div>

                <InputField
                  type="password"
                  autoComplete="current-password"
                  id="password"
                  errorMessage={errors?.password}
                  name="password"
                  value={password}
                  onValueChange={(value) => setPassword(value)}
                  changeOverride
                />

                {hasTwoFactor && (
                  <InputField
                    type="text"
                    autoComplete="one-time-code"
                    label={`2FA - ${t('one_time_password')}`}
                    id="one_time_password"
                    errorMessage={errors?.one_time_password}
                    name="one_time_password"
                    value={oneTimePassword}
                    onValueChange={(value) => setOneTimePassword(value)}
                    changeOverride
                  />
                )}

                <div className="space-y-2">
                  <div
                    className={classNames(
                      'flex flex-col lg:flex-row items-center',
                      {
                        'justify-between': isSelfHosted(),
                        'justify-end': isHosted(),
                      }
                    )}
                  >
                    {isSelfHosted() && <InputLabel>{t('secret')}</InputLabel>}

                    {isHosted() && (
                      <div
                        className="text-sm hover:underline cursor-pointer"
                        onClick={() => setIsDisable2faModalOpen(true)}
                        style={{ color: accentColor }}
                      >
                        {t('disable_2fa')}
                      </div>
                    )}
                  </div>
                </div>

                {isSelfHosted() && (
                  <InputField
                    type="password"
                    autoComplete="on"
                    placeholder={t('plaid_optional')}
                    name="secret"
                  />
                )}
              </>
            )}

            <ErrorMessage className="mt-4">{message}</ErrorMessage>

            <Button disabled={isFormBusy} className="mt-4" variant="block">
              {isEmailStep ? t('continue') : t('login')}
            </Button>
          </form>

          {isHosted() && isEmailStep && (
            <div className="mb-6 space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: colors.$5 }}
                />

                <span
                  className="text-xs uppercase tracking-wide"
                  style={{ color: colors.$17 }}
                >
                  {t('or')}
                </span>

                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: colors.$5 }}
                />
              </div>

              <SignInProviders />
            </div>
          )}

          <div className="flex justify-center">
            {isHosted() && <Link to="/register">{t('register_label')}</Link>}
          </div>
        </div>

        {isHosted() && (
          <div className="mx-4 max-w-md w-full rounded md:shadow-lg mt-4">
            <HostedLinks />
          </div>
        )}

        <p className="mt-4 text-xs">{version}</p>
      </div>

      <Disable2faModal
        visible={isDisable2faModalOpen}
        setVisible={setIsDisable2faModalOpen}
      />
    </div>
  );
}

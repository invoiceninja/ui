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
import { Alert } from '../../components/Alert';
import { HostedLinks } from './components/HostedLinks';
import { Header } from './components/Header';
import { useTitle } from '$app/common/hooks/useTitle';
import { request } from '$app/common/helpers/request';
import { SignInProviders } from './components/SignInProviders';
import { useLogin } from './common/hooks';
import { GenericValidationBag } from '$app/common/interfaces/validation-bag';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Disable2faModal } from './components/Disable2faModal';
import { useColorScheme } from '$app/common/colors';
import { version } from '$app/common/helpers/version';
import { toast } from '$app/common/helpers/toast/toast';
import classNames from 'classnames';

export function Login() {
  useTitle('login');

  const accentColor = useAccentColor();

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<LoginValidation | undefined>(undefined);
  const [isFormBusy, setIsFormBusy] = useState(false);
  const [t] = useTranslation();

  const [isDisable2faModalOpen, setIsDisable2faModalOpen] =
    useState<boolean>(false);

  const login = useLogin();

  function handleSubmit(form: HTMLFormElement) {
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
        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);
        } else if (error.response?.status === 503) {
          toast.error('app_maintenance');
        } else {
          setMessage(
            error.response?.data.message ?? (t('invalid_credentials') as string)
          );
        }
      })
      .finally(() => setIsFormBusy(false));
  }

  const colors = useColorScheme();

  return (
    <div className="h-screen">
      <Header />
      <div className="flex flex-col items-center">
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
              handleSubmit(e.currentTarget);
            }}
            className="my-6 space-y-4"
          >
            <InputField
              type="email"
              autoComplete="on"
              label={t('email_address')}
              errorMessage={errors?.email}
              name="email"
            />

            <InputField
              type="password"
              autoComplete="on"
              label={t('password')}
              id="password"
              errorMessage={errors?.password}
              name="password"
            />

            <div className="space-y-2">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <InputLabel>{`2FA - ${t('one_time_password')}`}</InputLabel>
                <Link to="/recover_password">{t('forgot_password')}</Link>
              </div>
            </div>

            <InputField
              type="text"
              autoComplete="on"
              id="one_time_password"
              placeholder={t('plaid_optional')}
              errorMessage={errors?.one_time_password}
              name="one_time_password"
            />

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
                <div
                  className="text-sm hover:underline cursor-pointer"
                  onClick={() => setIsDisable2faModalOpen(true)}
                  style={{ color: accentColor }}
                >
                  {t('disable_2fa')}
                </div>
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

            <div className="mx-4 max-w-md w-full rounded md:shadow-lg mt-4">
              <HostedLinks />
            </div>
          </>
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

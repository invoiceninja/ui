/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { Button } from '../../../../components/forms';
import {
  SignInProviderButton,
  msal,
} from '$app/pages/authentication/components/SignInProviders';
import { GoogleLogin } from '@react-oauth/google';

export function Connect() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const handleConnectMailer = (
    event: FormEvent<HTMLButtonElement>,
    mailer: 'google' | 'microsoft'
  ) => {
    event.preventDefault();

    toast.processing();

    window.location.href = endpoint('/auth/:mailer?react=true', { mailer });
  };

  const handleDisconnectMailer = (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/users/:id/disconnect_mailer', { id: user!.id }),
      {}
    ).then((response) => {
      toast.success(response.data.message);
      window.location.reload();
    });
  };

  const handleDisconnectOauth = (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/users/:id/disconnect_oauth', { id: user!.id })
    ).then((response) => {
      toast.success(response.data.message);
      window.location.reload();
    });
  };

  const handleMicrosoft = (token: string) => {
    request(
      'POST',
      endpoint(
        '/api/v1/connected_account?include=company_user&provider=microsoft'
      ),
      { accessToken: token }
    ).then(() => {
      window.location.reload();
    });
  };

  const handleGoogle = (token: string) => {
    request(
      'POST',
      endpoint(
        '/api/v1/connected_account?include=company_user&provider=google&id_token=:token',
        {
          token,
        }
      )
    ).then(() => {
      window.location.reload();
    });
  };

  return (
    <Card title={t('oneclick_login')}>
      {!user?.oauth_provider_id && (
        <>
          <div className="grid grid-cols-3 text-sm mt-4">
            <Element leftSide="Google">
              <GoogleLogin
                onSuccess={(response) =>
                  response.credential && handleGoogle(response.credential)
                }
                onError={() => toast.error()}
              />
            </Element>
          </div>
          <div className="grid grid-cols-3 text-sm mt-4">
            <Element leftSide="Microsoft">
              <SignInProviderButton
                onClick={async () => {
                  await msal.handleRedirectPromise();

                  msal
                    .loginPopup({
                      scopes: ['user.read'],
                    })
                    .then((response) => handleMicrosoft(response.accessToken));
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                >
                  <path fill="#f3f3f3" d="M0 0h23v23H0z"></path>
                  <path fill="#f35325" d="M1 1h10v10H1z"></path>
                  <path fill="#81bc06" d="M12 1h10v10H12z"></path>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"></path>
                  <path fill="#ffba08" d="M12 12h10v10H12z"></path>
                </svg>

                <p>Log in with Microsoft</p>
              </SignInProviderButton>
            </Element>
          </div>
        </>
      )}

      {user?.oauth_provider_id === 'google' && (
        <>
          <Element leftSide="Google">
            <Button type="minimal" onClick={handleDisconnectOauth}>
              {t('disconnect_google')}
            </Button>
          </Element>

          <Element leftSide="Gmail">
            {user?.oauth_user_token ? (
              <Button type="minimal" onClick={handleDisconnectMailer}>
                {t('disconnect_gmail')}
              </Button>
            ) : (
              <Button
                type="minimal"
                onClick={(event: FormEvent<HTMLButtonElement>) =>
                  handleConnectMailer(event, 'google')
                }
              >
                {t('connect_gmail')}
              </Button>
            )}
          </Element>
        </>
      )}

      {user?.oauth_provider_id === 'microsoft' && (
        <>
          <Element leftSide="Microsoft">
            <Button type="minimal" onClick={handleDisconnectOauth}>
              {t('disconnect_microsoft')}
            </Button>
          </Element>

          <Element leftSide="Email">
            {user?.oauth_user_token ? (
              <Button type="minimal" onClick={handleDisconnectMailer}>
                {t('disconnect_email')}
              </Button>
            ) : (
              <Button
                type="minimal"
                onClick={(event: FormEvent<HTMLButtonElement>) =>
                  handleConnectMailer(event, 'microsoft')
                }
              >
                {t('connect_email')}
              </Button>
            )}
          </Element>
        </>
      )}
    </Card>
  );
}

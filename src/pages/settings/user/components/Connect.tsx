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

export function Connect() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const handleConnectMailer = (
    event: FormEvent<HTMLButtonElement>,
    mailer: 'google' | 'microsoft'
  ) => {
    event.preventDefault();

    toast.processing();

    request(
      'GET',
      endpoint(`/auth/${mailer}`),
      {},
      { headers: { 'X-REACT': true } }
    )
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        toast.error();
        console.error(error);
      });
  };

  const handleDisconnectMailer = (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/users/:id/disconnect_mailer', { id: user!.id }),
      {},
      { headers: { 'X-REACT': true } }
    )
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        toast.error();
        console.error(error);
      });
  };

  const handleDisconnectOauth = (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/users/:id/disconnect_oauth', { id: user!.id })
    )
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        toast.error();
        console.error(error);
      });
  };

  const handleConnectOauth = (
    event: FormEvent<HTMLButtonElement>,
    provider: 'google' | 'microsoft'
  ) => {
    event.preventDefault();

    toast.processing();

    request(
      'POST',
      endpoint(`/api/v1/oauth_login?provider=${provider}&id_token=:token`, {
        token: localStorage.getItem('X-NINJA-TOKEN'),
      })
    )
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
        toast.error();
      });
  };

  return (
    <Card title={t('oneclick_login')}>
      {!user?.oauth_provider_id && (
        <>
          <Element leftSide="Google">
            <Button
              type="minimal"
              onClick={(event: FormEvent<HTMLButtonElement>) =>
                handleConnectMailer(event, 'google')
              }
            >
              {t('connect_google')}
            </Button>
          </Element>

          <Element leftSide="Microsoft">
            <Button
              type="minimal"
              onClick={(event: FormEvent<HTMLButtonElement>) =>
                handleConnectMailer(event, 'microsoft')
              }
            >
              {t('connect_microsoft')}
            </Button>
          </Element>
        </>
      )}

      {user?.oauth_provider_id === 'google' && (
        <>
          <Element leftSide="Google">
            <Button type="minimal" onClick={handleDisconnectMailer}>
              {t('disconnect_google')}
            </Button>
          </Element>

          <Element leftSide="Gmail">
            {user?.oauth_user_token ? (
              <Button type="minimal" onClick={handleDisconnectOauth}>
                {t('disconnect_gmail')}
              </Button>
            ) : (
              <Button
                type="minimal"
                onClick={(event: FormEvent<HTMLButtonElement>) =>
                  handleConnectOauth(event, 'google')
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
            <Button type="minimal" onClick={handleDisconnectMailer}>
              {t('disconnect_microsoft')}
            </Button>
          </Element>

          <Element leftSide="Email">
            {user?.oauth_user_token ? (
              <Button type="minimal" onClick={handleDisconnectOauth}>
                {t('disconnect_email')}
              </Button>
            ) : (
              <Button
                type="minimal"
                onClick={(event: FormEvent<HTMLButtonElement>) =>
                  handleConnectOauth(event, 'microsoft')
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

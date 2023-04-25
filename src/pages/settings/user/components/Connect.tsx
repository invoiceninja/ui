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
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { Button } from '../../../../components/forms';

export function Connect() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

  const handleConnectEmail = () => {
    const microsoftUrl =
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';

    const redirectUri = window.location.origin + '/auth/microsoft';

    const scope =
      'User.Read+email+Mail.Send+offline_access+profile+User.Read+openid';

    window.open(
      microsoftUrl +
        'client_id=' +
        microsoftClientId +
        '&redirect_uri=' +
        redirectUri +
        '&scope=' +
        scope +
        '&response_type=code&react=true'
    );
  };

  const handleConnectMailer = (mailer: 'google' | 'microsoft') => {
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

  const handleDisconnectMailer = () => {
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

  const handleDisconnectOauth = () => {
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

  return (
    <Card title={t('oneclick_login')}>
      {!user?.oauth_provider_id && (
        <>
          <Element leftSide="Google">
            <Button
              type="minimal"
              onClick={() => handleConnectMailer('google')}
            >
              {t('connect_google')}
            </Button>
          </Element>

          <Element leftSide="Microsoft">
            <Button
              type="minimal"
              onClick={() => handleConnectMailer('microsoft')}
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
              <Button type="minimal">{t('connect_gmail')}</Button>
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
              <Button type="minimal" onClick={handleConnectEmail}>
                {t('connect_email')}
              </Button>
            )}
          </Element>
        </>
      )}
    </Card>
  );
}

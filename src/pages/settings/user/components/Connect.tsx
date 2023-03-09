/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

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

  return (
    <Card title={t('oneclick_login')}>
      {!user?.oauth_provider_id && (
        <>
          <Element leftSide="Google">
            <Button type="minimal">{t('connect_google')}</Button>
          </Element>

          <Element leftSide="Microsoft">
            <Button type="minimal">{t('connect_microsoft')}</Button>
          </Element>
        </>
      )}

      {user?.oauth_provider_id === 'google' && (
        <>
          <Element leftSide="Google">
            <Button type="minimal">{t('disconnect_google')}</Button>
          </Element>

          <Element leftSide="Gmail">
            <Button type="minimal">{t('connect_gmail')}</Button>
          </Element>
        </>
      )}

      {user?.oauth_provider_id === 'microsoft' && (
        <>
          <Element leftSide="Microsoft">
            <Button type="minimal">{t('disconnect_microsoft')}</Button>
          </Element>

          <Element leftSide="Email">
            <Button type="minimal" onClick={handleConnectEmail}>
              {t('connect_email')}
            </Button>
          </Element>
        </>
      )}
    </Card>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { Button } from '../../../../components/forms';

export function Connect() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const handleConnectEmail = () => {
    window.open(
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=1023b9ce-5b09-4f04-98f8-e1ed85a72332&redirect_uri=https://app.invoicing.co/auth/microsoft&scope=User.Read+email+Mail.Send+offline_access+profile+User.Read+openid&response_type=code&react=true'
    );
  };

  return (
    <Card title={t('oneclick_login')}>
      {!user?.oauth_provider_id && (
        <>
          <Element leftSide="Google">
            <Button type="minimal">{t('connect_google')}</Button>
          </Element>

          <Element leftSide="Microsoft" onClick={handleConnectEmail}>
            <Button type="minimal">{t('connect_microsoft')}</Button>
          </Element>
        </>
      )}

      {user?.oauth_provider_id === 'google' && (
        <Element leftSide="Gmail">
          <Button type="minimal">{t('connect_gmail')}</Button>
        </Element>
      )}

      {user?.oauth_provider_id === 'microsoft' && (
        <Element leftSide="Email">
          <Button type="minimal">{t('connect_email')}</Button>
        </Element>
      )}
    </Card>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { TwoFactorAuthenticationModals } from '../common/components/TwoFactorAuthenticationModals';
import { useState } from 'react';

export function TwoFactorAuthentication() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const [isDisableModalOpen, setIsDisableModalOpen] = useState<boolean>(false);

  const [checkVerification, setCheckVerification] = useState<boolean>(false);

  return (
    <>
      <TwoFactorAuthenticationModals
        checkVerification={checkVerification}
        setCheckVerification={setCheckVerification}
        isDisableModalOpen={isDisableModalOpen}
        setIsDisableModalOpen={setIsDisableModalOpen}
      />

      <Card title={t('enable_two_factor')}>
        <Element leftSide="2FA">
          {!user?.google_2fa_secret && (
            <Button
              behavior="button"
              type="minimal"
              onClick={() => setCheckVerification(true)}
            >
              {t('enable')}
            </Button>
          )}

          {user?.google_2fa_secret && (
            <Button
              behavior="button"
              type="minimal"
              onClick={() => setIsDisableModalOpen(true)}
            >
              {t('disable')}
            </Button>
          )}
        </Element>
      </Card>
    </>
  );
}

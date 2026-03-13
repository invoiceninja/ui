/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { TwoFactorAuthenticationModals } from '../common/components/TwoFactorAuthenticationModals';
import { useState } from 'react';
import { PasskeyAuthenticationModal } from '../common/components/PasskeyAuthenticationModal';

export function TwoFactorAuthentication() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const [isDisableModalOpen, setIsDisableModalOpen] = useState<boolean>(false);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState<boolean>(false);

  const [checkVerification, setCheckVerification] = useState<boolean>(false);

  return (
    <>
      <TwoFactorAuthenticationModals
        checkVerification={checkVerification}
        setCheckVerification={setCheckVerification}
        isDisableModalOpen={isDisableModalOpen}
        setIsDisableModalOpen={setIsDisableModalOpen}
      />
      <PasskeyAuthenticationModal
        visible={isPasskeyModalOpen}
        setVisible={setIsPasskeyModalOpen}
      />

      <>
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

        <Element leftSide={t('passkey')}>
          <Button
            behavior="button"
            type="minimal"
            onClick={() => setIsPasskeyModalOpen(true)}
          >
            {user?.passkey_enabled
              ? `${t('manage')} (${user.passkey_count ?? 0})`
              : t('enable')}
          </Button>
        </Element>
      </>
    </>
  );
}

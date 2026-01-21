/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useRef } from 'react';

import AppleSignInButton, { AppleAuthResponse } from 'react-apple-signin-auth';
import { v4 } from 'uuid';
import { toast } from '$app/common/helpers/toast/toast';

function generateSecureNonce(): string {
  return v4().replace(/-/g, '');
}

function generateSecureState(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = v4().slice(0, 8);
  return `${timestamp}_${randomPart}`;
}

interface Props {
  handleSignIn: (response: AppleAuthResponse) => void;
}

export function AppleOauth({ handleSignIn }: Props) {
  const currentSessionRef = useRef<{
    state: string;
    nonce: string;
    timestamp: number;
  } | null>(null);

  const createNewSession = () => {
    const newSession = {
      state: generateSecureState(),
      nonce: generateSecureNonce(),
      timestamp: Date.now(),
    };

    currentSessionRef.current = newSession;
    return newSession;
  };

  const validateSession = (receivedState: string): boolean => {
    const session = currentSessionRef.current;

    if (!session) {
      return false;
    }

    if (session.state !== receivedState) {
      return false;
    }

    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - session.timestamp > tenMinutes) {
      return false;
    }

    return true;
  };

  const handleAppleSuccess = (response: AppleAuthResponse) => {
    if (!validateSession(response.authorization.code)) {
      toast.error('something_went_wrong');
      return;
    }

    currentSessionRef.current = null;

    handleSignIn(response);
  };

  const handleAppleError = (error: { error: string }) => {
    currentSessionRef.current = null;

    if (error?.error !== 'popup_closed_by_user') {
      toast.error('something_went_wrong');
    }
  };

  const authOptions = (() => {
    const session = createNewSession();

    return {
      clientId: 'com.invoiceninja.client',
      scope: 'email name',
      redirectURI: 'https://beta.invoicing.co/login',
      state: session.state,
      nonce: session.nonce,
      usePopup: true,
    };
  })();

  return (
    <AppleSignInButton
      authOptions={authOptions}
      uiType="dark"
      onSuccess={handleAppleSuccess}
      onError={handleAppleError}
    />
  );
}

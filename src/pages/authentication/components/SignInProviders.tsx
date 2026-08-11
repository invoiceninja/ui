/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PublicClientApplication } from '@azure/msal-browser';
import { GoogleLogin } from '@react-oauth/google';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { ReactNode, useEffect, useRef, useState } from 'react';
import AppleSignin from 'react-apple-signin-auth';
import { useDispatch } from 'react-redux';
import { v4 } from 'uuid';
import { AuthenticationTypes } from '$app/common/dtos/authentication';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { CompanyUser } from '$app/common/interfaces/company-user';
import {
  changeCurrentIndex,
  resetChanges,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { authenticate } from '$app/common/stores/slices/user';

interface SignInProviderButtonProps {
  disabled?: boolean;
  onClick?: () => unknown;
  children: ReactNode;
}

export function SignInProviderButton(props: SignInProviderButtonProps) {
  return (
    <button
      disabled={props.disabled}
      onClick={props.onClick}
      className="w-full h-10 rounded px-4 bg-white border border-gray-200 flex justify-center items-center space-x-2 text-center hover:bg-gray-50 cursor-pointer text-sm disabled:cursor-not-allowed"
    >
      {props.children}
    </button>
  );
}

export function SignInProviders() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const login = (response: AxiosResponse) => {
    localStorage.removeItem('X-CURRENT-INDEX');

    let currentIndex = 0;

    const companyUsers: CompanyUser[] = response.data.data;
    const defaultCompanyId = companyUsers[0].account.default_company_id;

    currentIndex =
      companyUsers.findIndex(
        (companyUser) => companyUser.company.id === defaultCompanyId
      ) || 0;

    dispatch(
      authenticate({
        type: AuthenticationTypes.TOKEN,
        user: response.data.data[currentIndex].user,
        token: response.data.data[currentIndex].token.token,
      })
    );

    dispatch(updateCompanyUsers(response.data.data));
    dispatch(resetChanges('company'));
    dispatch(changeCurrentIndex(currentIndex));

    // Trigger DocuNinja data fetch after successful login
    queryClient.invalidateQueries({
      queryKey: ['/api/docuninja/login'],
    });
  };

  const handleGoogle = (token: string) => {
    request(
      'POST',
      endpoint(
        '/api/v1/oauth_login?provider=google&id_token=:token&create=true',
        {
          token,
        }
      )
    ).then((response) => login(response));
  };

  const handleApple = (response: any) => {
    request('POST', endpoint('/api/v1/oauth_login?provider=apple'), {
      id_token: response.authorization.id_token,
    }).then((response) => login(response));
  };

  const handleMicrosoft = (token: string) => {
    request('POST', endpoint('/api/v1/oauth_login?provider=microsoft'), {
      accessToken: token,
    }).then((response) => login(response));
  };

  const msal = createMsal();

  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-stretch gap-3 w-full"
    >
      {width > 0 && (
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(response) =>
              response.credential && handleGoogle(response.credential)
            }
            onError={() => toast.error()}
            width={width}
            text="signin_with"
            logo_alignment="center"
          />
        </div>
      )}

      <SignInProviderButton
        onClick={async () => {
          if (!msal) return;

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

      {import.meta.env.VITE_ENABLE_APPLE_LOGIN === 'true' ? (
        <AppleSignin
          authOptions={{
            clientId: 'com.invoiceninja.client',
            scope: 'email name',
            redirectURI: 'https://invoicing.co/auth/apple',
            state: '',
            nonce: v4(),
            usePopup: true,
          }}
          uiType="dark"
          onSuccess={handleApple}
          onError={() => toast.error()}
          render={(props: { onClick: () => void; disabled?: boolean }) => (
            <button
              type="button"
              onClick={props.onClick}
              disabled={props.disabled}
              className="w-full h-10 rounded px-4 bg-black text-white border border-black flex justify-center items-center space-x-2 text-center hover:opacity-90 cursor-pointer text-sm disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>

              <span>Continue with Apple</span>
            </button>
          )}
        />
      ) : null}
    </div>
  );
}

export function createMsal() {
  const msal =
    typeof window !== 'undefined'
      ? new PublicClientApplication({
          auth: {
            clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
          },
        })
      : null;

  if (msal) {
    msal.initialize();
  }

  return msal;
}

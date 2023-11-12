/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { AuthenticationTypes } from '$app/common/dtos/authentication';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { CompanyUser } from '$app/common/interfaces/company-user';
import {
  changeCurrentIndex,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { authenticate } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { ReactNode } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from '$app/common/helpers/toast/toast';
import { PublicClientApplication } from '@azure/msal-browser';

export const msal = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI,
  },
});

msal.initialize();

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
      className="rounded px-4 py-2 bg-white border border-gray-200 flex justify-center items-center space-x-2 text-center hover:bg-gray-50 cursor-pointer text-sm disabled:cursor-not-allowed"
    >
      {props.children}
    </button>
  );
}

export function SignInProviders() {
  const dispatch = useDispatch();

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
    dispatch(changeCurrentIndex(currentIndex));
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

  const handleMicrosoft = (token: string) => {
    request('POST', endpoint('/api/v1/oauth_login?provider=microsoft'), {
      accessToken: token,
    }).then((response) => login(response));
  };

  return (
    <div className="grid grid-cols-3 text-sm mt-4">
      <div className="col-span-3 flex flex-col items-center space-y-3">
        <GoogleLogin
          onSuccess={(response) =>
            response.credential && handleGoogle(response.credential)
          }
          onError={() => toast.error()}
        />

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

        {/* 
          eslint-disable-next-line 
          @typescript-eslint/ban-ts-comment 
        */}
        {/* @ts-ignore */}
        {/* <MicrosoftLogin
          clientId={microsoftClientId}
          authCallback={authHandler}
          redirectUri={'https://app.invoicing.co/'}
        >
          <SignInProviderButton>
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
        </MicrosoftLogin> */}
      </div>
    </div>
  );
}

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
import { AuthenticationTypes } from 'common/dtos/authentication';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { CompanyUser } from 'common/interfaces/company-user';
import {
  changeCurrentIndex,
  updateCompanyUsers,
} from 'common/stores/slices/company-users';
import { setMsal } from 'common/stores/slices/user';
import { authenticate } from 'common/stores/slices/user';
import { useDispatch } from 'react-redux';
import MicrosoftLogin from 'react-microsoft-login';
import { ReactNode } from 'react';
import { GoogleLogin, GoogleLoginResponse } from '@leecheuk/react-google-login';

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
      className="rounded px-4 py-2 bg-white shadow-md flex justify-center items-center space-x-2 text-center hover:bg-gray-50 cursor-pointer text-sm disabled:cursor-not-allowed"
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

  const handleGoogle = (response: GoogleLoginResponse) => {
    request(
      'POST',
      endpoint('/api/v1/oauth_login?provider=google&id_token=:token', {
        token: response.tokenObj.id_token,
      })
    ).then((response) => login(response));
  };

  const authHandler = (err: any, data: any, msal: any) => {
    dispatch(setMsal(msal));

    request(
      'POST',
      endpoint('/api/v1/oauth_login?provider=microsoft'),
      data
    ).then((response) => login(response));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

  return (
    <div className="grid grid-cols-3 text-sm mt-4">
      <div className="col-span-3 flex flex-col items-center space-y-3">
        <GoogleLogin
          clientId={googleClientId}
          render={(renderProps) => (
            <SignInProviderButton
              disabled={renderProps.disabled || false}
              onClick={renderProps.onClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M-3.264 51.509c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                  transform="translate(27.009 -39.239)"
                ></path>
                <path
                  fill="#34A853"
                  d="M-14.754 63.239c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"
                  transform="translate(27.009 -39.239)"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M-21.484 53.529c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
                  transform="translate(27.009 -39.239)"
                ></path>
                <path
                  fill="#EA4335"
                  d="M-14.754 43.989c1.77 0 3.35.61 4.6 1.8l3.42-3.42c-2.07-1.94-4.78-3.13-8.02-3.13-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  transform="translate(27.009 -39.239)"
                ></path>
              </svg>

              <p>Log in with Google</p>
            </SignInProviderButton>
          )}
          buttonText="Login"
          onSuccess={(response) =>
            handleGoogle(response as GoogleLoginResponse)
          }
          onFailure={handleGoogle}
          cookiePolicy={'single_host_origin'}
        />

        {/* 
          eslint-disable-next-line 
          @typescript-eslint/ban-ts-comment 
        */}
        {/* @ts-ignore */}
        <MicrosoftLogin
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
        </MicrosoftLogin>
      </div>
    </div>
  );
}

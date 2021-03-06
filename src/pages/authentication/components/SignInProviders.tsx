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
import GoogleLogin from 'react-google-login';
import { useDispatch } from 'react-redux';
import MicrosoftLogin from 'react-microsoft-login';

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

  const handleGoogle = (response: any) => {
    request(
      'POST',
      endpoint('/api/v1/oauth_login?provider=google&id_token=:token', {
        token: response.tokenId,
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

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

  return (
    <div className="grid grid-cols-3 text-sm my-4">
      <div className="col-span-3 flex flex-col space-y-3">
        <GoogleLogin
          clientId={googleClientId}
          buttonText="Sign in with Google"
          onSuccess={handleGoogle}
          onFailure={handleGoogle}
          cookiePolicy={'single_host_origin'}
        />

        <MicrosoftLogin
          clientId={microsoftClientId}
          authCallback={authHandler}
          redirectUri={'https://app.invoicing.co/'}
        />
      </div>
    </div>
  );
}

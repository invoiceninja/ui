/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiEndpoint, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { SignInProviderButton } from './SignInProviders';

interface OidcConfig {
  oidc_enabled: boolean;
  oidc_provider_label: string;
}

/**
 * Renders a "Sign in with <label>" button on the login page when the
 * self-hosted backend reports that generic OIDC SSO is configured.
 *
 * We hit the public GET /api/v1/oidc/config endpoint on mount to
 * discover whether an IdP is wired and, if so, what label to show.
 * Clicking the button navigates the browser to the backend's
 * <API>/auth/oidc endpoint which kicks off the OpenID Connect
 * authorization code flow.
 */
export function OidcSignIn() {
  const [t] = useTranslation();

  // skipIntercept + no retry: older self-hosted backends don't ship this
  // endpoint yet; a 404 must silently hide the button rather than trip the
  // global interceptor (toast, clear-localstorage, or reload loop). Cached
  // via react-query so parent re-renders don't refire the request.
  const { data: config } = useQuery({
    queryKey: ['/api/v1/oidc/config'],
    queryFn: () =>
      request('GET', endpoint('/api/v1/oidc/config'), undefined, {
        skipIntercept: true,
      }).then((response) => response.data as OidcConfig),
    staleTime: Infinity,
    retry: false,
  });

  if (!config?.oidc_enabled) {
    return null;
  }

  const label = config.oidc_provider_label || 'OIDC';

  return (
    <div className="grid grid-cols-3 text-sm mt-4">
      <div className="col-span-3 flex flex-col items-center space-y-3">
        <SignInProviderButton
          onClick={() => {
            window.location.href = `${apiEndpoint()}/auth/oidc`;
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3L12 16.9 6.5 19.5l1-6.3L3 8.9 9 8z" />
          </svg>
          <p>{t('sign_in_with', { provider: label })}</p>
        </SignInProviderButton>
      </div>
    </div>
  );
}

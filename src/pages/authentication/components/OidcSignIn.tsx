/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
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
  const [config, setConfig] = useState<OidcConfig | null>(null);

  useEffect(() => {
    let cancelled = false;

    request('GET', endpoint('/api/v1/oidc/config'))
      .then((response) => {
        if (!cancelled) {
          setConfig(response.data as OidcConfig);
        }
      })
      .catch(() => {
        // Endpoint may not exist on older backends – silently hide the button.
        if (!cancelled) {
          setConfig({ oidc_enabled: false, oidc_provider_label: 'OIDC' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
          <p>Sign in with {label}</p>
        </SignInProviderButton>
      </div>
    </div>
  );
}

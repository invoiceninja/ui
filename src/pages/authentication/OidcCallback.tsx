/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useLogin } from './common/hooks';

/**
 * Landing route for the browser-side OIDC (and, in the future, any other
 * redirect-based) OAuth flow.
 *
 * The self-hosted backend redirects here after a successful Authentik
 * (or other OpenID Connect) login with the newly issued CompanyToken in
 * the `?token=` query string. We swap that token for a full CompanyUser
 * payload via POST /api/v1/refresh_react and hand it to the shared
 * `useLogin()` hook so the auth Redux slice ends up in exactly the same
 * shape as after a normal password login.
 */
export function OidcCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (!token) {
      setError('Missing OIDC token in callback URL.');
      return;
    }

    request('POST', endpoint('/api/v1/refresh_react'), undefined, {
      headers: { 'X-API-TOKEN': token },
    })
      .then((response) => {
        login(response);
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ?? 'Failed to complete OIDC login.'
        );
      });
  }, [login, navigate, searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 px-4 text-center">
        <h1 className="text-xl font-semibold">Sign-in failed</h1>
        <p className="text-sm text-gray-600 max-w-md">{error}</p>
        <button
          type="button"
          className="rounded px-4 py-2 bg-white border border-gray-200 text-sm hover:bg-gray-50"
          onClick={() => navigate('/login', { replace: true })}
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen text-sm text-gray-600">
      Signing you in…
    </div>
  );
}

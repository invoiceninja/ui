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
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useLogin } from './common/hooks';

/**
 * Landing route for the browser-side OIDC (and, in the future, any other
 * redirect-based) OAuth flow.
 *
 * The self-hosted backend redirects here after a successful Authentik
 * (or other OpenID Connect) login with a short-lived `?code=` query-
 * string value — a 64-char random exchange code, not the CompanyToken
 * itself, so the real token never lands in browser history, Referer
 * headers, or upstream access logs. We POST that code to the public
 * one-shot `POST /api/v1/oidc/exchange` endpoint, receive the actual
 * CompanyToken back, and then swap it for a full CompanyUser payload
 * via `POST /api/v1/refresh_react` — same shared `useLogin()` hook and
 * Redux shape as a normal password login.
 */
export function OidcCallback() {
  const [t] = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (!code) {
      setError(t('oidc_missing_code') as string);
      return;
    }

    // skipIntercept on both hops: without it, a 401/429/404 from the exchange
    // or refresh trips the global interceptor into clearLocalStorage() +
    // window.location.reload(), which lands us right back on /oidc/callback
    // with the same failing code and loops forever.
    request(
      'POST',
      endpoint('/api/v1/oidc/exchange'),
      { code },
      { skipIntercept: true }
    )
      .then((exchangeResponse) => {
        const token = exchangeResponse?.data?.token as string | undefined;

        if (!token) {
          setError(t('oidc_no_token') as string);
          return;
        }

        return request('POST', endpoint('/api/v1/refresh_react'), undefined, {
          headers: { 'X-API-TOKEN': token },
          skipIntercept: true,
        }).then((response) => {
          login(response);
          navigate('/dashboard', { replace: true });
        });
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ?? (t('oidc_login_failed') as string)
        );
      });
  }, [login, navigate, searchParams, t]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 px-4 text-center">
        <h1 className="text-xl font-semibold">{t('sign_in_failed')}</h1>
        <p className="text-sm text-gray-600 max-w-md">{error}</p>
        <button
          type="button"
          className="rounded px-4 py-2 bg-white border border-gray-200 text-sm hover:bg-gray-50"
          onClick={() => navigate('/login', { replace: true })}
        >
          {t('back_to_login')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen text-sm text-gray-600">
      {t('signing_you_in')}
    </div>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { CalendarProvider } from '$app/common/interfaces/user';
import { useCompleteCalendarConnection } from '$app/common/queries/calendar';
import { updateUser } from '$app/common/stores/slices/user';
import { Spinner } from '$app/components/Spinner';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Complete() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const complete = useCompleteCalendarConnection();
  const ranRef = useRef(false);

  useEffect(() => {
    // StrictMode invokes effects twice in dev. We strip secrets from the URL
    // on the first run, so a second run would see empty params and false-fail.
    if (ranRef.current) return;
    ranRef.current = true;

    // BrowserRouter puts params in location.search; HashRouter puts them
    // after the '?' inside location.hash (e.g. #/calendar_connection/complete?…).
    const search =
      window.location.search ||
      (window.location.hash.includes('?')
        ? `?${window.location.hash.split('?').slice(1).join('?')}`
        : '');
    const params = new URLSearchParams(search);

    const status = params.get('calendar_connection');
    const provider = params.get('provider') as CalendarProvider | null;
    const state = params.get('state');
    const code = params.get('code');

    // Strip secrets from the URL before any await. Preserve the router mode
    // by rewriting just the query side of whichever segment carried them.
    const cleanPath = window.location.hash.startsWith('#/')
      ? `${window.location.pathname}${window.location.hash.split('?')[0]}`
      : `${window.location.pathname}`;
    window.history.replaceState({}, '', cleanPath);

    const done = (ok: boolean) => {
      if (ok) {
        toast.success('connect_calendar');
        if (user) {
          dispatch(
            updateUser({
              ...user,
              referral_meta: {
                ...(user.referral_meta ?? {}),
                calendar_connection: { status: 'CONNECTED' },
              },
            })
          );
        }
      } else {
        toast.error();
      }
      navigate('/tasks/calendar', { replace: true });
    };

    if (
      status === 'denied' ||
      status === 'failed' ||
      !provider ||
      !state ||
      !code
    ) {
      done(false);
      return;
    }

    complete
      .mutateAsync({ provider, state, code })
      .then(() => done(true))
      .catch(() => done(false));
  }, []);

  return <Spinner />;
}

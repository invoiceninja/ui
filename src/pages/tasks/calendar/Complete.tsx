/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import {
  isCalendarProvider,
  useCompleteCalendarConnection,
} from '$app/common/queries/calendar';
import type { CalendarProvider, User } from '$app/common/interfaces/user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { updateUser } from '$app/common/stores/slices/user';
import { Spinner } from '$app/components/Spinner';
import { Button } from '$app/components/forms';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

// The connected state lives on the calendar page (read from Redux). This
// OAuth-return page only needs to do one of two things: bounce straight back
// on success, or tell the user it didn't work. Every non-success outcome —
// denied consent, expired/tampered handoff, missing plan, server error —
// collapses into a single failure the user has to acknowledge.
type Phase = 'completing' | 'failed';

export function markCalendarConnected(user: User, email?: string): User {
  return {
    ...user,
    settings: {
      ...(user.settings ?? {}),
      calendar_connection: {
        ...(user.settings?.calendar_connection ?? {}),
        status: 'CONNECTED',
        ...(email ? { email } : {}),
      },
    },
  };
}

function completeResponseEmail(response: unknown): string | undefined {
  const email = (
    response as {
      data?: { data?: { calendar_connection?: { email?: unknown } } };
    }
  )?.data?.data?.calendar_connection?.email;

  return typeof email === 'string' ? email : undefined;
}

export default function Complete() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const userRef = useRef<User | undefined>();
  userRef.current = user;
  const complete = useCompleteCalendarConnection();

  const [phase, setPhase] = useState<Phase>('completing');
  const [provider, setProvider] = useState<CalendarProvider | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const search =
      location.search ||
      (location.hash.includes('?')
        ? `?${location.hash.split('?').slice(1).join('?')}`
        : '');
    const params = new URLSearchParams(search);
    const rawProvider = params.get('provider');
    const status = params.get('calendar_connection');
    const handoff = params.get('handoff');
    const parsedProvider = isCalendarProvider(rawProvider) ? rawProvider : null;

    setProvider(parsedProvider);

    // No params (reload, back-nav, or interceptor force-reload after success)
    // → there's nothing to complete. Silently bounce; the calendar page reads
    // the actual connection status from Redux.
    if (!status && !handoff) {
      navigate('/tasks/calendar', { replace: true });
      return;
    }

    // Denied/failed callback, unknown provider, or a missing handoff token all
    // mean we can't finalise the connection.
    if (
      status === 'denied' ||
      status === 'failed' ||
      !parsedProvider ||
      !handoff
    ) {
      setPhase('failed');
      return;
    }

    complete
      .mutateAsync({ provider: parsedProvider, handoff })
      .then((response) => {
        const currentUser = userRef.current;

        if (currentUser?.id) {
          dispatch(
            updateUser(
              markCalendarConnected(
                currentUser,
                completeResponseEmail(response)
              )
            )
          );
        }

        $refetch(['users']);
        // Nothing to show on success — bounce straight to the calendar, which
        // surfaces the connected state itself.
        navigate('/tasks/calendar', { replace: true });
      })
      .catch(() => setPhase('failed'));
  }, []);

  const ProviderIcon =
    provider === 'microsoft'
      ? FaMicrosoft
      : provider === 'google'
        ? FaGoogle
        : null;

  const goToCalendar = () => navigate('/tasks/calendar', { replace: true });

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: colors.$2 }}
    >
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-4 py-10 px-8 rounded-lg border shadow-sm max-w-md text-center"
        style={{ borderColor: colors.$24, backgroundColor: colors.$1 }}
      >
        {ProviderIcon && <ProviderIcon size={28} color={colors.$3} />}

        {phase === 'completing' ? (
          <Spinner />
        ) : (
          <>
            <div className="text-3xl" style={{ color: '#ef4444' }} aria-hidden>
              !
            </div>

            <h1 className="text-base font-medium" style={{ color: colors.$3 }}>
              {t('calendar_connect_failed')}
            </h1>

            <p className="text-sm" style={{ color: colors.$17 }}>
              {t('calendar_connect_failed_body')}
            </p>

            <Button behavior="button" onClick={goToCalendar} disableWithoutIcon>
              {t('back_to_calendar')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

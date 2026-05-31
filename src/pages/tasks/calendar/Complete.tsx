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
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import {
  isCalendarProvider,
  useCompleteCalendarConnection,
} from '$app/common/queries/calendar';
import { CalendarProvider } from '$app/common/interfaces/user';
import { updateUser } from '$app/common/stores/slices/user';
import { Spinner } from '$app/components/Spinner';
import { Button } from '$app/components/forms';
import { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

type Phase = 'completing' | 'success' | 'denied' | 'expired' | 'mismatch' | 'error';

interface ParsedParams {
  status: string | null;
  provider: CalendarProvider | null;
  handoff: string | null;
}

const readParams = (): ParsedParams => {
  const search =
    window.location.search ||
    (window.location.hash.includes('?')
      ? `?${window.location.hash.split('?').slice(1).join('?')}`
      : '');

  const params = new URLSearchParams(search);
  const rawProvider = params.get('provider');
  return {
    status: params.get('calendar_connection'),
    provider: isCalendarProvider(rawProvider) ? rawProvider : null,
    handoff: params.get('handoff'),
  };
};

// Translate API error → coarse phase the UI can branch on.
const classifyError = (error: unknown): Phase => {
  const status =
    (error as AxiosError | undefined)?.response?.status ?? undefined;
  if (status === 404 || status === 410) return 'expired';
  if (status === 422 || status === 400) return 'mismatch';
  return 'error';
};

export default function Complete() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const complete = useCompleteCalendarConnection();

  const [phase, setPhase] = useState<Phase>('completing');
  const [provider, setProvider] = useState<CalendarProvider | null>(null);
  const ranRef = useRef(false);
  const redirectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const { status, provider: parsedProvider, handoff } = readParams();
    setProvider(parsedProvider);

    // No params (reload, back-nav, or interceptor force-reload after success)
    // → there's nothing to complete. Silently bounce; the calendar page reads
    // the actual connection status from Redux.
    if (!status && !handoff) {
      navigate('/tasks/calendar', { replace: true });
      return;
    }

    if (status === 'denied') {
      setPhase('denied');
      return;
    }
    if (status === 'failed') {
      setPhase('error');
      return;
    }

    if (!parsedProvider) {
      setPhase('mismatch');
      return;
    }

    if (!handoff) {
      // Status said pending but no handoff token — link expired or tampered.
      setPhase('expired');
      return;
    }

    complete
      .mutateAsync({ provider: parsedProvider, handoff })
      .then(() => {
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
        setPhase('success');
        // Brief beat so the user sees the success state before redirect.
        redirectTimerRef.current = window.setTimeout(
          () => navigate('/tasks/calendar', { replace: true }),
          600
        );
      })
      .catch((error) => setPhase(classifyError(error)));

    return () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const ProviderIcon =
    provider === 'microsoft'
      ? FaMicrosoft
      : provider === 'google'
      ? FaGoogle
      : null;

  const goToCalendar = () =>
    navigate('/tasks/calendar', { replace: true });

  const heading: Record<Phase, string> = {
    completing: t('connecting_calendar'),
    success: t('calendar_connected'),
    denied: t('calendar_connection_denied'),
    expired: t('calendar_handoff_expired'),
    mismatch: t('calendar_handoff_invalid'),
    error: t('calendar_connect_failed'),
  };

  const body: Record<Phase, string> = {
    completing: t('processing'),
    success: t('redirecting'),
    denied: t('calendar_connection_denied_body'),
    expired: t('calendar_handoff_expired_body'),
    mismatch: t('calendar_handoff_invalid_body'),
    error: t('calendar_connect_failed_body'),
  };

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

        {phase === 'completing' && <Spinner />}

        {phase === 'success' && (
          <div
            className="text-3xl"
            style={{ color: '#10b981' }}
            aria-hidden
          >
            ✓
          </div>
        )}

        {(phase === 'denied' ||
          phase === 'expired' ||
          phase === 'mismatch' ||
          phase === 'error') && (
          <div
            className="text-3xl"
            style={{ color: '#ef4444' }}
            aria-hidden
          >
            !
          </div>
        )}

        <h1 className="text-base font-medium" style={{ color: colors.$3 }}>
          {heading[phase]}
        </h1>

        <p className="text-sm" style={{ color: colors.$17 }}>
          {body[phase]}
        </p>

        {phase !== 'completing' && phase !== 'success' && (
          <Button behavior="button" onClick={goToCalendar} disableWithoutIcon>
            {t('back_to_calendar')}
          </Button>
        )}
      </div>
    </div>
  );
}

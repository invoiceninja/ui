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
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  useConnectCalendar,
  useDisconnectCalendar,
} from '$app/common/queries/calendar';
import { CalendarProvider } from '$app/common/interfaces/user';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';

// Cap the wait at 5 minutes — if the user wanders off without finishing, we
// stop polling and tear down the watcher. They can click connect again.
const POPUP_TIMEOUT_MS = 5 * 60 * 1000;
const POPUP_POLL_MS = 500;

export function CalendarConnectCta() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const user = useCurrentUser();
  const calendar = user?.referral_meta?.calendar;

  const connect = useConnectCalendar();
  const disconnect = useDisconnectCalendar();

  // Track the popup + watcher so unmount tears everything down cleanly.
  const popupRef = useRef<Window | null>(null);
  const watcherRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const teardown = () => {
    if (watcherRef.current) {
      clearInterval(watcherRef.current);
      watcherRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    popupRef.current = null;
  };

  useEffect(() => () => teardown(), []);

  const finishConnect = (success: boolean) => {
    teardown();
    toast.dismiss();
    if (success) {
      $refetch(['users']);
    }
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Forward-compat: backend may post a self-closing page once the
      // callback finishes. Accept either same-origin or a known shape.
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string } | undefined;
      if (data?.type === 'calendar:connected') {
        finishConnect(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleConnect = (provider: CalendarProvider) => {
    // Open the popup synchronously inside the click handler so the browser's
    // popup blocker doesn't kick in. We point it at about:blank first and
    // navigate it once the API hands us the authorize URL.
    const popup = window.open(
      'about:blank',
      'calendar-oauth',
      'width=540,height=680,menubar=no,toolbar=no,location=no'
    );

    if (!popup) {
      toast.error('popup_blocked');
      return;
    }

    popupRef.current = popup;
    toast.processing();

    connect.mutate(provider, {
      onSuccess: (url) => {
        if (!popupRef.current || popupRef.current.closed) {
          toast.dismiss();
          return;
        }

        popupRef.current.location.href = url;

        // Fallback when the backend just redirects the popup back to the
        // app (rather than posting a message): once the popup closes, assume
        // the user finished and refetch.
        watcherRef.current = setInterval(() => {
          if (!popupRef.current || popupRef.current.closed) {
            finishConnect(true);
          }
        }, POPUP_POLL_MS);

        timeoutRef.current = setTimeout(() => {
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }
          finishConnect(false);
        }, POPUP_TIMEOUT_MS);
      },
      onError: () => {
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
        teardown();
        toast.error();
      },
    });
  };

  const handleDisconnect = () => {
    toast.processing();
    disconnect.mutate(undefined, {
      onSuccess: () => {
        toast.success('disconnect_calendar');
      },
      onError: () => {
        toast.error();
      },
    });
  };

  if (calendar?.connected) {
    const Icon = calendar.provider === 'google' ? FaGoogle : FaMicrosoft;
    return (
      <div
        className="inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs"
        style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
      >
        <Icon size={12} color={colors.$3} />
        <span style={{ color: colors.$3 }}>{calendar.email}</span>
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={disconnect.isLoading}
          aria-label={t('disconnect_calendar') as string}
          className="ml-1 leading-none"
          style={{ color: colors.$17 }}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <Dropdown
      label={t('connect_calendar') as string}
      labelButtonBorderColor={colors.$5}
    >
      <DropdownElement
        onClick={() => handleConnect('google')}
        icon={<FaGoogle size={14} />}
      >
        {t('connect_google_calendar')}
      </DropdownElement>
      <DropdownElement
        onClick={() => handleConnect('microsoft')}
        icon={<FaMicrosoft size={14} />}
      >
        {t('connect_microsoft_calendar')}
      </DropdownElement>
    </Dropdown>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { CalendarEvent } from '$app/common/interfaces/calendar-event';
import { CalendarProvider } from '$app/common/interfaces/user';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { $refetch } from '../hooks/useRefetch';

interface CalendarEventsParams {
  from: string;
  to: string;
  enabled?: boolean;
}

export function useCalendarEventsQuery(params: CalendarEventsParams) {
  return useQuery<CalendarEvent[]>(
    ['calendar_events', params.from, params.to],
    () =>
      request(
        'GET',
        endpoint('/api/v1/calendar_connection/events?from=:from&to=:to', {
          from: params.from,
          to: params.to,
        })
      ).then((response: { data: unknown }) => {
        // API shape today: { data: { events: CalendarEvent[] } }
        // Be defensive in case the wrapper changes.
        const body = response.data;
        const inner = (body as { data?: unknown })?.data ?? body;
        const events =
          (inner as { events?: unknown })?.events ??
          (Array.isArray(inner) ? inner : null);
        return Array.isArray(events) ? (events as CalendarEvent[]) : [];
      }),
    {
      enabled: params.enabled ?? true,
      staleTime: 60_000,
    }
  );
}

const CALENDAR_CONTEXTS: Record<CalendarProvider, string> = {
  google: 'calendar_google',
  microsoft: 'calendar_microsoft',
};

export function useConnectCalendar() {
  return useMutation(async (provider: CalendarProvider): Promise<string> => {
    const response = await request(
      'POST',
      endpoint('/api/v1/one_time_token'),
      { context: CALENDAR_CONTEXTS[provider] }
    );

    const hash = (response.data as { hash: string }).hash;

    return endpoint('/api/v1/calendar_connection/:provider/authorize/:hash', {
      provider,
      hash,
    });
  });
}

export function useCompleteCalendarConnection() {
  return useMutation(
    (v: { provider: CalendarProvider; state: string; code: string }) =>
      request(
        'POST',
        endpoint('/api/v1/calendar_connection/:provider/complete', {
          provider: v.provider,
        }),
        { state: v.state, code: v.code }
      )
  );
}

export function useDisconnectCalendar() {
  const queryClient = useQueryClient();

  return useMutation(
    () => request('DELETE', endpoint('/api/v1/calendar_connection')),
    {
      onSuccess: () => {
        queryClient.removeQueries(['calendar_events']);
        $refetch(['users']);
      },
    }
  );
}

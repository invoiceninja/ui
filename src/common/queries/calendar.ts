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

interface CalendarEventsResponse {
  data: CalendarEvent[];
}

export function useCalendarEventsQuery(params: CalendarEventsParams) {
  return useQuery<CalendarEvent[]>(
    ['calendar_events', params.from, params.to],
    () =>
      request(
        'GET',
        endpoint('/api/v1/calendar/events?from=:from&to=:to', {
          from: params.from,
          to: params.to,
        })
      ).then((response: { data: CalendarEventsResponse }) => response.data.data),
    {
      enabled: params.enabled ?? true,
      staleTime: 60_000,
    }
  );
}

export function useConnectCalendar() {
  return useMutation(
    (provider: CalendarProvider) =>
      request('POST', endpoint('/api/v1/calendar/oauth/start'), {
        provider,
      }).then((response: { data: { url: string } }) => response.data.url)
  );
}

export function useDisconnectCalendar() {
  const queryClient = useQueryClient();

  return useMutation(
    () => request('DELETE', endpoint('/api/v1/calendar/connection')),
    {
      onSuccess: () => {
        queryClient.removeQueries(['calendar_events']);
        $refetch(['users']);
      },
    }
  );
}

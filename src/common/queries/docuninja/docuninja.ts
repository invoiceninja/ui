import { useQuery } from 'react-query';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { AxiosResponse } from 'axios';

interface Params {
  enabled?: boolean;
}

export function useLogin({ enabled = true }: Params) {
  return useQuery(
    ['/api/docuninja/login'],
    () =>
      request(
        'POST',
        endpoint('/api/docuninja/login'),
        {},
        { skipIntercept: true }
      ).then((res) => res.data.data),
    {
      enabled,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Don't retry on 401 errors (expected when no account exists)
        if ((error as any)?.response?.status === 401) {
          return false;
        }
        // Retry other errors up to 3 times
        return failureCount < 3;
      },
    }
  );
}

export function useCreate(): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/docuninja/create'));
}

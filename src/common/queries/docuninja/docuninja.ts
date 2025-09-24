import { useQuery } from 'react-query';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { AxiosResponse } from 'axios';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { get } from 'lodash';
import collect from 'collect.js';

interface Params {
  enabled?: boolean;
}

export function useLogin({ enabled = true }: Params) {
  const company = useCurrentCompany();

  return useQuery(
    ['/api/docuninja/login'],
    () =>
      request(
        'POST',
        endpoint('/api/docuninja/login'),
        {},
        { skipIntercept: true }
      ).then((response) => {
        const c = collect(get(response.data, 'data.companies', []))
          .where('ninja_company_key', company.company_key)
          .first() as { id: string } | undefined;

        if (c) {
          localStorage.setItem('DOCUNINJA_COMPANY_ID', c.id);
        }

        return response.data.data;
      }),
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

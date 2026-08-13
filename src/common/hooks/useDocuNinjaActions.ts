/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';

// This hook ONLY provides actions, no data fetching
export function useDocuNinjaActions() {
  const queryClient = useQueryClient();
  const setData = useSetAtom(docuNinjaAtom);

  const getToken = (): string => {
    return localStorage.getItem('X-DOCU-NINJA-TOKEN') || '';
  };

  const createAccount = () => {
    return request(
      'POST',
      endpoint('/api/docuninja/create'),
      {},
      { skipIntercept: true }
    ).then(() => {
      // Refetch the data after creating account
      return queryClient.invalidateQueries({
        queryKey: ['/api/docuninja/login'],
      });
    });
  };

  const refresh = () => {
    return queryClient.invalidateQueries({
      queryKey: ['/api/docuninja/login'],
    });
  };

  const flushData = () => {
    setData(undefined);
  };

  return {
    createAccount,
    getToken,
    refresh,
    flushData,
  };
}

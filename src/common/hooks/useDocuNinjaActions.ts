/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from 'react-query';
import { useSetAtom } from 'jotai';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';

// This hook ONLY provides actions, no data fetching
export function useDocuNinjaActions() {
  const queryClient = useQueryClient();
  const setData = useSetAtom(docuNinjaAtom);

  const getToken = (): string => {
    return localStorage.getItem('X-DOCU-NINJA-TOKEN') || '';
  };

  const createAccount = async () => {

      await request(
        'POST',
        endpoint('/api/docuninja/create'),
        {},
        { skipIntercept: true }
      );
      
      // Refetch the data after creating account
      await queryClient.invalidateQueries(['/api/docuninja/login']);

    };

  const refresh = () => {
    return queryClient.invalidateQueries(['/api/docuninja/login']);
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

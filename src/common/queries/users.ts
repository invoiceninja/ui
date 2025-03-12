/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { GenericQueryOptions } from './invoices';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { toast } from '../helpers/toast/toast';
import { useRefetch } from '../hooks/useRefetch';
import { useOnWrongPasswordEnter } from '../hooks/useOnWrongPasswordEnter';
import { Dispatch, SetStateAction } from 'react';

export function useUsersQuery() {
  return useQuery(
    ['/api/v1/users'],
    () => request('GET', endpoint('/api/v1/users')),
    { staleTime: Infinity }
  );
}

interface UserQueryProps extends GenericQueryOptions {
  id: string;
}

export function useUserQuery(options: UserQueryProps) {
  return useQuery(
    ['/api/v1/users', options.id],
    () =>
      request(
        'GET',
        endpoint('/api/v1/users/:id?include=company_user', { id: options.id })
      ),
    { enabled: options.enabled, staleTime: Infinity }
  );
}

export function useBlankUserQuery() {
  const { isAdmin } = useAdmin();

  return useQuery(
    ['/api/v1/users/create'],
    () => request('GET', endpoint('/api/v1/users/create')),
    { staleTime: Infinity, enabled: isAdmin }
  );
}

interface Params {
  setIsPasswordConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function useBulk(params: Params) {
  const $refetch = useRefetch();

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  const { setIsPasswordConfirmModalOpen } = params;

  return (
    ids: string[],
    action: 'archive' | 'restore' | 'delete',
    password: string,
    isPasswordRequired: boolean
  ) => {
    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/users/bulk'),
      {
        action,
        ids,
      },
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => {
        toast.success(`${action}d_user`);

        $refetch(['users']);
      })
      .catch((error) => {
        if (error.response?.status === 412) {
          onWrongPasswordEnter(isPasswordRequired);
          setIsPasswordConfirmModalOpen(true);
        }
      });
  };
}

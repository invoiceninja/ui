/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTagFilterCleanup } from '$app/common/hooks/useEntityTagFilters';
import { User } from '$app/common/interfaces/user';
import { FilterColumn } from '$app/components/DataTable';

interface Params {
  user: boolean;
  assignedUser: boolean;
}

const formatUserName = (user: User) => {
  if (!user.first_name && !user.last_name) {
    return user.email;
  }

  return `${user.first_name} ${user.last_name}`;
};

export function useResolveUserName() {
  const company = useCurrentCompany();

  return (userId: string | undefined) => {
    const user = company?.users?.find(({ id }) => id === userId);

    return user ? formatUserName(user) : '';
  };
}

export function useEntityUserFilterColumns(params: Params) {
  const { user, assignedUser } = params;

  const company = useCurrentCompany();

  useTagFilterCleanup(user, 'user_id');
  useTagFilterCleanup(assignedUser, 'assigned_user_id');

  const options =
    company?.users?.map((currentUser) => ({
      label: formatUserName(currentUser),
      value: currentUser.id,
    })) || [];

  const filterColumns: FilterColumn[] = [];

  if (assignedUser) {
    filterColumns.push({
      column_id: 'assigned_user_id',
      query_identifier: 'assigned_user_ids',
      options,
    });
  }

  if (user) {
    filterColumns.push({
      column_id: 'user_id',
      query_identifier: 'user_ids',
      options,
    });
  }

  return filterColumns;
}

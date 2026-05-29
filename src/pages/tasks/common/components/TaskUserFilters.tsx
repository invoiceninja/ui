/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { UserSelector } from '$app/components/users/UserSelector';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

interface TaskUserFiltersState {
  userId: string;
  assignedUserId: string;
  canViewAll: boolean;
  setUserId: (id: string) => void;
  setAssignedUserId: (id: string) => void;
  queryString: string;
}

// URL-backed user / assigned-user filter state shared by Daily, Weekly and
// Calendar. Users without the `view_all` permission are pinned to their own
// id so they never see other people's tasks.
export function useTaskUserFilters(): TaskUserFiltersState {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasPermission = useHasPermission();
  const currentUser = useCurrentUser();

  const canViewAll = hasPermission('view_all');

  const rawUserId = searchParams.get('user_id') || '';
  const rawAssignedUserId = searchParams.get('assigned_user_id') || '';

  const userId = canViewAll ? rawUserId : currentUser?.id || '';
  const assignedUserId = canViewAll
    ? rawAssignedUserId
    : currentUser?.id || '';

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const setUserId = (id: string) => update('user_id', id);
  const setAssignedUserId = (id: string) => update('assigned_user_id', id);

  const parts: string[] = [];
  if (userId) parts.push(`user_id=${userId}`);
  if (assignedUserId) parts.push(`assigned_user_id=${assignedUserId}`);
  const queryString = parts.length ? '&' + parts.join('&') : '';

  return {
    userId,
    assignedUserId,
    canViewAll,
    setUserId,
    setAssignedUserId,
    queryString,
  };
}

interface Props {
  state: TaskUserFiltersState;
}

export function TaskUserFilters({ state }: Props) {
  const [t] = useTranslation();

  if (!state.canViewAll) return null;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="w-48">
        <UserSelector
          inputLabel={t('user')}
          value={state.userId || undefined}
          onChange={(user) => state.setUserId(user?.id ?? '')}
          onClearButtonClick={() => state.setUserId('')}
          withoutAction
        />
      </div>
      <div className="w-48">
        <UserSelector
          inputLabel={t('assigned_user')}
          value={state.assignedUserId || undefined}
          onChange={(user) => state.setAssignedUserId(user?.id ?? '')}
          onClearButtonClick={() => state.setAssignedUserId('')}
          withoutAction
        />
      </div>
    </div>
  );
}

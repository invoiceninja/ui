/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ComboboxAsync } from '$app/components/forms/Combobox';
import { User } from '$app/common/interfaces/user';
import { Project } from '$app/common/interfaces/project';
import { endpoint } from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

interface TaskUserFilterState {
  userId: string;
  projectId: string;
  canViewAll: boolean;
  setUserId: (id: string) => void;
  setProjectId: (id: string) => void;
  queryString: string;
}

// URL-backed user + project filters for the task views (List, Kanban, Daily,
// Weekly, Calendar). The user picker drives both `user_id` (creator) and
// `assigned_user_id` (assignee); the project picker drives `project_tasks`.
// Users without the `view_all` permission have the picker hidden and emit no
// user filter — the API already scopes results to what they may see.
export function useTaskUserFilters(): TaskUserFilterState {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasPermission = useHasPermission();

  const canViewAll = hasPermission('view_all');

  const rawUser = searchParams.get('user') || '';
  const userId = canViewAll ? rawUser : '';
  const projectId = searchParams.get('project') || '';

  const setUserId = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('user', id);
    else next.delete('user');
    setSearchParams(next);
  };

  const setProjectId = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('project', id);
    else next.delete('project');
    setSearchParams(next);
  };

  const parts: string[] = [];
  if (userId) parts.push(`user_id=${userId}`, `assigned_user_id=${userId}`);
  if (projectId) parts.push(`project_tasks=${projectId}`);
  const queryString = parts.length ? `&${parts.join('&')}` : '';

  return {
    userId,
    projectId,
    canViewAll,
    setUserId,
    setProjectId,
    queryString,
  };
}

interface Props {
  state: TaskUserFilterState;
}

export function TaskUserFilter({ state }: Props) {
  const [t] = useTranslation();

  if (!state.canViewAll) return null;

  return (
    <div className="w-56 shrink-0">
      <ComboboxAsync<User>
        inputOptions={{
          value: state.userId || null,
          placeholder: t('filter_by_user') ?? 'Filter by user…',
        }}
        endpoint={endpoint('/api/v1/users?status=active')}
        entryOptions={{
          id: 'id',
          value: 'id',
          label: 'first_name',
          inputLabelFn: (resource) =>
            resource ? `${resource.first_name} ${resource.last_name}` : '',
          dropdownLabelFn: (resource) =>
            `${resource.first_name} ${resource.last_name}`,
        }}
        onChange={(entry) =>
          entry.resource ? state.setUserId(entry.resource.id) : null
        }
        onDismiss={() => state.setUserId('')}
        staleTime={Infinity}
      />
    </div>
  );
}

export function TaskProjectFilter({ state }: Props) {
  return (
    <div className="w-56 shrink-0">
      <ComboboxAsync<Project>
        inputOptions={{
          value: state.projectId || null,
          placeholder: 'Filter by project…',
        }}
        endpoint={endpoint('/api/v1/projects?status=active')}
        entryOptions={{
          id: 'id',
          value: 'id',
          label: 'name',
        }}
        onChange={(entry) =>
          entry.resource ? state.setProjectId(entry.resource.id) : null
        }
        onDismiss={() => state.setProjectId('')}
        staleTime={Infinity}
      />
    </div>
  );
}

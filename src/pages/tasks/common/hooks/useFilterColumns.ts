import { User } from '$app/common/interfaces/user';
import { useClientsQuery } from '$app/common/queries/clients';
import { useProjectsQuery } from '$app/common/queries/projects';
import { useUsersQuery } from '$app/common/queries/users';
import { FilterColumn } from '$app/components/DataTable';

export function useFilterColumns() {
  const { data: users } = useUsersQuery();
  const { data: clients } = useClientsQuery({ status: ['active'] });
  const { data: projects } = useProjectsQuery({ status: ['active'] });

  const filterColumns: FilterColumn[] = [
    {
      column_id: 'assigned_user_id',
      query_identifier: 'user_ids',
      options:
        users?.data.data.map((user: User) => ({
          label:
            user.first_name || user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.email,
          value: user.id,
        })) || [],
    },
    {
      column_id: 'project_id',
      query_identifier: 'project_ids',
      options:
        projects?.map((project) => ({
          label: project.name,
          value: project.id,
        })) || [],
    },
    {
      column_id: 'client_id',
      query_identifier: 'client_ids',
      options:
        clients?.map((client) => ({
          label: client.display_name,
          value: client.id,
        })) || [],
    },
  ];

  return filterColumns;
}

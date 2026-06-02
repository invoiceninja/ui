import { TAG_ENTITY_TYPES } from '$app/common/interfaces/tag';
import { User } from '$app/common/interfaces/user';
import { useClientsQuery } from '$app/common/queries/clients';
import { useProjectsQuery } from '$app/common/queries/projects';
import { useTagsQuery } from '$app/common/queries/tags';
import { useUsersQuery } from '$app/common/queries/users';
import { FilterColumn } from '$app/components/DataTable';
import { isActiveTag } from '$app/components/tags/TagPills';

export function useFilterColumns() {
  const { data: users } = useUsersQuery();
  const { data: clients } = useClientsQuery({ status: ['active'] });
  const { data: projects } = useProjectsQuery({ status: ['active'] });
  const { data: tags } = useTagsQuery({ entityType: TAG_ENTITY_TYPES.task });

  const filterColumns: FilterColumn[] = [
    {
      column_id: 'assigned_user_id',
      query_identifier: 'assigned_user_ids',
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
    {
      column_id: 'task_tag_ids',
      query_identifier: 'tag_ids',
      options:
        tags?.data.filter(isActiveTag).map((tag) => ({
          label: tag.name,
          value: tag.id,
        })) || [],
    },
  ];

  return filterColumns;
}

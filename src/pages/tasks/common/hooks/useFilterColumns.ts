import { TAG_ENTITY_TYPES } from '$app/common/interfaces/tag';
import { useClientsQuery } from '$app/common/queries/clients';
import { useProjectsQuery } from '$app/common/queries/projects';
import { FilterColumn } from '$app/components/DataTable';
import { useEntityTagFilterColumns } from '$app/common/hooks/useEntityTagFilters';
import { useEntityUserFilterColumns } from '$app/common/hooks/useEntityUserFilters';

export function useFilterColumns() {
  const { data: clients } = useClientsQuery({ status: ['active'] });
  const { data: projects } = useProjectsQuery({ status: ['active'] });
  const tagFilterColumns = useEntityTagFilterColumns(
    TAG_ENTITY_TYPES.task,
    'task_tag_ids'
  );
  const userFilterColumns = useEntityUserFilterColumns({
    user: true,
    assignedUser: true,
  });

  const filterColumns: FilterColumn[] = [
    ...userFilterColumns,
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
    ...tagFilterColumns,
  ];

  return filterColumns;
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from '$app/common/enums/entity-state';
import { date, endpoint, getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Project } from '$app/common/interfaces/project';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { EntityStatus } from '$app/components/EntityStatus';
import { Icon } from '$app/components/icons/Icon';
import { Tooltip } from '$app/components/Tooltip';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdDesignServices,
  MdDownload,
  MdEdit,
  MdRestore,
  MdTextSnippet,
} from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { projectAtom } from './atoms';
import { useBulkAction } from './hooks/useBulkAction';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useInvoiceProject } from '$app/pages/projects/common/hooks/useInvoiceProject';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Task } from '$app/common/interfaces/task';
import { useSetAtom } from 'jotai';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useCombineProjectsTasks } from './hooks/useCombineProjectsTasks';
import { CustomBulkAction } from '$app/components/DataTable';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { Dispatch, SetStateAction } from 'react';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';

export const defaultColumns: string[] = [
  'name',
  'task_rate',
  'due_date',
  'public_notes',
  'private_notes',
  'budgeted_hours',
  'entity_state',
];

export function useAllProjectColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'project',
    });

  const projectColumns = [
    'name',
    'client',
    'task_rate',
    'due_date',
    'public_notes',
    'private_notes',
    'budgeted_hours',
    'entity_state',
    'archived_at',
    //   'assigned_to', @Todo: Need to resolve translation
    //   'client_id_number', @Todo: Need to resolve translation
    //   'client_number', @Todo: Need to resolve translation
    'created_at',
    //   'created_by', @Todo: Need to resolve translation
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'documents',
    'is_deleted',
    'number',
    'updated_at',
    'total_hours',
  ] as const;

  return projectColumns;
}

export function useProjectColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const formatMoney = useFormatMoney();

  const reactSettings = useReactSettings();

  const projectColumns = useAllProjectColumns();
  type ProjectColumns = (typeof projectColumns)[number];

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'project',
    });

  const columns: DataTableColumnsExtended<Project, ProjectColumns> = [
    {
      column: 'name',
      id: 'name',
      label: t('name'),
      format: (value, project) => (
        <DynamicLink
          to={route('/projects/:id', { id: project.id })}
          renderSpan={disableNavigation('project', project)}
        >
          {value}
        </DynamicLink>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, project) =>
        project.client && (
          <DynamicLink
            to={route('/clients/:id', { id: value.toString() })}
            renderSpan={disableNavigation('client', project.client)}
          >
            {project.client.display_name}
          </DynamicLink>
        ),
    },
    {
      column: 'task_rate',
      id: 'task_rate',
      label: t('task_rate'),
      format: (value, task) =>
        formatMoney(
          value,
          task.client?.country_id,
          task.client?.settings.currency_id
        ),
    },
    {
      column: 'due_date',
      id: 'due_date',
      label: t('due_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span dangerouslySetInnerHTML={{ __html: value as string }} />
        </Tooltip>
      ),
    },
    {
      column: 'private_notes',
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span dangerouslySetInnerHTML={{ __html: value as string }} />
        </Tooltip>
      ),
    },
    {
      column: 'budgeted_hours',
      id: 'budgeted_hours',
      label: t('budgeted_hours'),
      format: (value) => value,
    },
    {
      column: 'total_hours',
      id: 'current_hours',
      label: t('total_hours'),
      format: (value) => value,
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: firstCustom,
      id: 'custom_value1',
      label: firstCustom,
      format: (value) => formatCustomFieldValue('project1', value?.toString()),
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
      format: (value) => formatCustomFieldValue('project2', value?.toString()),
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
      format: (value) => formatCustomFieldValue('project3', value?.toString()),
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
      format: (value) => formatCustomFieldValue('project4', value?.toString()),
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, project) => project.documents.length,
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value, project) => (project.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.project || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useActions() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const hasPermission = useHasPermission();

  const queryClient = useQueryClient();

  const bulk = useBulkAction();

  const invoiceProject = useInvoiceProject();

  const { isEditOrShowPage, isShowPage } = useEntityPageIdentifier({
    entity: 'project',
    editPageTabs: ['documents'],
  });

  const setProject = useSetAtom(projectAtom);

  const cloneToProject = (project: Project) => {
    setProject({ ...project, id: '', documents: [], number: '' });

    navigate('/projects/create?action=clone');
  };

  const handleInvoiceProject = (project: Project) => {
    toast.processing();

    queryClient
      .fetchQuery(
        [
          '/api/v1/tasks',
          'project_tasks',
          project.id,
          'per_page',
          100,
          'status',
          'active',
        ],
        () =>
          request(
            'GET',
            endpoint(
              '/api/v1/tasks?project_tasks=:projectId&per_page=100&status=active',
              {
                projectId: project.id,
              }
            )
          ),
        { staleTime: Infinity }
      )
      .then((response: GenericSingleResourceResponse<Task[]>) => {
        toast.dismiss();

        const unInvoicedTasks = response.data.data.filter(
          (task) => !task.invoice_id
        );

        if (!response.data.data.length) {
          return toast.error('no_assigned_tasks');
        }

        invoiceProject(unInvoicedTasks);
      });
  };

  const { setChangeTemplateResources, setChangeTemplateVisible } =
    useChangeTemplate();

  const actions = [
    (project: Project) =>
      isShowPage && (
        <DropdownElement
          onClick={() =>
            navigate(route('/projects/:id/edit', { id: project.id }))
          }
          icon={<Icon element={MdEdit} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    () => isShowPage && <Divider withoutPadding />,
    (project: Project) =>
      hasPermission('create_invoice') && (
        <DropdownElement
          onClick={() => handleInvoiceProject(project)}
          icon={<Icon element={MdTextSnippet} />}
        >
          {t('invoice_project')}
        </DropdownElement>
      ),
    (project: Project) =>
      hasPermission('create_project') && (
        <DropdownElement
          onClick={() => cloneToProject(project)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone')}
        </DropdownElement>
      ),
    (project: Project) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources([project]);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
    () => isEditOrShowPage && <Divider withoutPadding />,
    (project: Project) =>
      getEntityState(project) === EntityState.Active &&
      isEditOrShowPage && (
        <DropdownElement
          onClick={() => bulk(project.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (project: Project) =>
      (getEntityState(project) === EntityState.Archived ||
        getEntityState(project) === EntityState.Deleted) &&
      isEditOrShowPage && (
        <DropdownElement
          onClick={() => bulk(project.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (project: Project) =>
      (getEntityState(project) === EntityState.Active ||
        getEntityState(project) === EntityState.Archived) &&
      isEditOrShowPage && (
        <DropdownElement
          onClick={() => bulk(project.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

export const useCustomBulkActions = () => {
  const [t] = useTranslation();
  const invoiceProject = useInvoiceProject();
  const combineProjectsTasks = useCombineProjectsTasks();

  const hasPermission = useHasPermission();

  const documentsBulk = useDocumentsBulk();

  const handleInvoiceProjects = (tasks: Task[] | null) => {
    if (tasks && !tasks.length) {
      return toast.error('no_assigned_tasks');
    }

    if (!tasks) {
      return toast.error('multiple_client_error');
    }

    invoiceProject(tasks);
  };

  const shouldDownloadDocuments = (projects: Project[]) => {
    return projects.some(({ documents }) => documents.length);
  };

  const getDocumentsIds = (projects: Project[]) => {
    return projects.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const handleDownloadDocuments = (
    selectedProjects: Project[],
    setSelected: Dispatch<SetStateAction<string[]>>
  ) => {
    const projectIds = getDocumentsIds(selectedProjects);

    documentsBulk(projectIds, 'download');
    setSelected([]);
  };

  const { setChangeTemplateVisible, setChangeTemplateResources } =
    useChangeTemplate();

  const customBulkActions: CustomBulkAction<Project>[] = [
    ({ selectedIds, selectedResources, setSelected }) =>
      hasPermission('create_invoice') && (
        <DropdownElement
          onClick={async () => {
            handleInvoiceProjects(
              await combineProjectsTasks(selectedIds, selectedResources)
            );

            setSelected([]);
          }}
          icon={<Icon element={MdTextSnippet} />}
        >
          {t('invoice_project')}
        </DropdownElement>
      ),
    ({ selectedResources, setSelected }) => (
      <DropdownElement
        onClick={() =>
          shouldDownloadDocuments(selectedResources)
            ? handleDownloadDocuments(selectedResources, setSelected)
            : toast.error('no_documents_to_download')
        }
        icon={<Icon element={MdDownload} />}
      >
        {t('documents')}
      </DropdownElement>
    ),
    ({ selectedResources }) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources(selectedResources);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
  ];

  return customBulkActions;
};

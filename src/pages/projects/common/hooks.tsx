/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { EntityState } from 'common/enums/entity-state';
import { date, getEntityState } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { Project } from 'common/interfaces/project';
import { Divider } from 'components/cards/Divider';
import { customField } from 'components/CustomField';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { EntityStatus } from 'components/EntityStatus';
import { Icon } from 'components/icons/Icon';
import { useUpdateAtom } from 'jotai/utils';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdRestore,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { projectAtom } from './atoms';
import { useBulkAction } from './hooks/useBulkAction';

export const projectColumns = [
  'name',
  //   'client', @Todo: Need to resolve translation
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
  'custom1',
  'custom2',
  'custom3',
  'custom4',
  'documents',
  'is_deleted',
  'number',
  'updated_at',
] as const;

export type ProjectColumns = (typeof projectColumns)[number];

export const defaultColumns: ProjectColumns[] = [
  'name',
  'task_rate',
  'due_date',
  'public_notes',
  'private_notes',
  'budgeted_hours',
  'entity_state',
];

export function useProjectColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const currentUser = useCurrentUser();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  const columns: DataTableColumnsExtended<Project, ProjectColumns> = [
    {
      column: 'name',
      id: 'name',
      label: t('name'),
      format: (value, project) => (
        <Link to={route('/projects/:id/edit', { id: project.id })}>
          {value}
        </Link>
      ),
    },
    {
      column: 'task_rate',
      id: 'task_rate',
      label: t('task_rate'),
      format: (value) =>
        formatMoney(
          value,
          company?.settings.country_id,
          company?.settings.currency_id
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
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      column: 'private_notes',
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      column: 'budgeted_hours',
      id: 'budgeted_hours',
      label: t('budgeted_hours'),
      format: (value) =>
        formatMoney(
          value,
          company?.settings.country_id,
          company?.settings.currency_id
        ),
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
      column: 'custom1',
      id: 'custom_value1',
      label:
        (company?.custom_fields.project1 &&
          customField(company?.custom_fields.project1).label()) ||
        t('first_custom'),
    },
    {
      column: 'custom2',
      id: 'custom_value2',
      label:
        (company?.custom_fields.project2 &&
          customField(company?.custom_fields.project2).label()) ||
        t('second_custom'),
    },
    {
      column: 'custom3',
      id: 'custom_value3',
      label:
        (company?.custom_fields.project3 &&
          customField(company?.custom_fields.project3).label()) ||
        t('third_custom'),
    },
    {
      column: 'custom4',
      id: 'custom_value4',
      label:
        (company?.custom_fields.project4 &&
          customField(company?.custom_fields.project4).label()) ||
        t('forth_custom'),
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
    currentUser?.company_user?.settings?.react_table_columns?.project ||
    defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useActions() {
  const [t] = useTranslation();

  const location = useLocation();

  const navigate = useNavigate();

  const bulk = useBulkAction();

  const isEditPage = location.pathname.endsWith('/edit');

  const setProject = useUpdateAtom(projectAtom);

  const cloneToProject = (project: Project) => {
    setProject({ ...project, id: '', documents: [], number: '' });

    navigate('/projects/create?action=clone');
  };

  const actions = [
    (project: Project) => (
      <DropdownElement
        onClick={() => cloneToProject(project)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone')}
      </DropdownElement>
    ),
    () => isEditPage && <Divider withoutPadding />,
    (project: Project) =>
      getEntityState(project) === EntityState.Active &&
      isEditPage && (
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
      isEditPage && (
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
      isEditPage && (
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

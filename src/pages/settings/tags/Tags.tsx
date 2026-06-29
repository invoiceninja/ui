/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  TAG_ENTITY_TYPES,
  Tag,
  TagEntityType,
} from '$app/common/interfaces/tag';
import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';
import { Settings } from '$app/components/layouts/Settings';
import { Tabs } from '$app/components/Tabs';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import Toggle from '$app/components/forms/Toggle';
import { useColorScheme } from '$app/common/colors';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { useAtomValue } from 'jotai';

interface TableProps {
  entityType: TagEntityType;
  createRoute: string;
  editRoute: string;
}

function TagTable(props: TableProps) {
  const [t] = useTranslation();

  const columns: DataTableColumns<Tag> = [
    {
      id: 'name',
      label: t('name'),
      format: (value, tag) => (
        <Link to={route(props.editRoute, { id: tag.id })}>{value}</Link>
      ),
    },
    {
      id: 'color',
      label: t('color'),
      format: (value) => (
        <div
          className="h-4 w-10 rounded-sm border border-gray-300"
          style={{ backgroundColor: value ? value.toString() : 'transparent' }}
        />
      ),
    },
  ];

  return (
    <DataTable
      resource="tag"
      columns={columns}
      endpoint={`/api/v1/tags?entity_type=${encodeURIComponent(
        props.entityType
      )}&sort=name|asc`}
      bulkRoute="/api/v1/tags/bulk"
      linkToCreate={props.createRoute}
      linkToEdit={props.editRoute}
      withResourcefulActions
      enableSavingFilterPreference
    />
  );
}

export function Tags() {
  useTitle('tags');

  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useInjectCompanyChanges();
  const disableSettingsField = useDisableSettingsField();
  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();
  const handleChangeProperty = useHandleCurrentCompanyChangeProperty();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tags'), href: '/settings/tags' },
  ];

  const tabs = [
    { name: t('tasks'), href: '/settings/tags' },
    { name: t('projects'), href: '/settings/tags/projects' },
  ];

  return (
    <Settings
      title={t('tags')}
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={isFormBusy}
    >
      <div className="space-y-4">
        <Card
          title={t('settings')}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="global_tag_inheritance"
                labelElement={
                  <SettingsLabel
                    label={t('global_tag_inheritance')}
                    helpLabel={t('global_tag_inheritance_help')}
                  />
                }
                defaultValue={false}
              />
            }
          >
            <Toggle
              checked={Boolean(company?.settings?.global_tag_inheritance)}
              onChange={(value) =>
                handleChangeProperty('settings.global_tag_inheritance', value)
              }
              disabled={disableSettingsField('global_tag_inheritance')}
            />
          </Element>
        </Card>

        <Tabs tabs={tabs} fullRightPadding withHorizontalPaddingOnSmallScreen />

        <Outlet />
      </div>
    </Settings>
  );
}

export function TaskTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.task}
      createRoute="/settings/tags/tasks/create"
      editRoute="/settings/tags/tasks/:id/edit"
    />
  );
}

export function ProjectTags() {
  return (
    <TagTable
      entityType={TAG_ENTITY_TYPES.project}
      createRoute="/settings/tags/projects/create"
      editRoute="/settings/tags/projects/:id/edit"
    />
  );
}

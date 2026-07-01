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
  TAG_ENTITY_TYPE_OPTIONS,
  TAG_ENTITY_TYPE_VALUES,
  Tag,
  TagEntityType,
  resolveTagEntityType,
} from '$app/common/interfaces/tag';
import { Badge } from '$app/components/Badge';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { SelectOption } from '$app/components/datatables/Actions';
import { Icon } from '$app/components/icons/Icon';
import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';
import { Settings } from '$app/components/layouts/Settings';
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
import { MdEdit } from 'react-icons/md';

function TagsTable() {
  const [t] = useTranslation();

  const getEditRoute = () => '/settings/tags/:id/edit';

  const getEntityTypeLabel = (entityType: string) => {
    return t(resolveTagEntityType(entityType));
  };

  const getEntityTypeBadgeVariant = (entityType: string) => {
    const resolvedEntityType = resolveTagEntityType(entityType);

    if (resolvedEntityType === TAG_ENTITY_TYPES.project) {
      return 'light-blue';
    }

    if (resolvedEntityType === TAG_ENTITY_TYPES.task) {
      return 'generic';
    }

    return 'teal';
  };

  const getEntityTypeFilterColor = (entityType: TagEntityType) => {
    if (entityType === TAG_ENTITY_TYPES.global) {
      return '#0D9488';
    }

    if (entityType === TAG_ENTITY_TYPES.project) {
      return '#93C5FD';
    }

    if (entityType === TAG_ENTITY_TYPES.task) {
      return '#6B7280';
    }

    return '#64748B';
  };

  const columns: DataTableColumns<Tag> = [
    {
      id: 'name',
      label: t('name'),
      format: (value, tag) => (
        <Link to={route(getEditRoute(), { id: tag.id })}>{value}</Link>
      ),
    },
    {
      id: 'entity_type',
      label: t('type'),
      format: (value) => (
        <Badge variant={getEntityTypeBadgeVariant(value as string)}>
          {getEntityTypeLabel(value as string)}
        </Badge>
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

  const filters: SelectOption[] = TAG_ENTITY_TYPE_OPTIONS.map(
    ({ labelKey, value }) => ({
      label: t(labelKey),
      value,
      color: 'white',
      backgroundColor: getEntityTypeFilterColor(value),
      queryKey: 'entity_types',
    })
  );

  return (
    <DataTable
      resource="tag"
      columns={columns}
      endpoint="/api/v1/tags?sort=name|asc"
      bulkRoute="/api/v1/tags/bulk"
      customActions={[
        (tag: Tag) => (
          <DropdownElement
            to={route(getEditRoute(), { id: tag.id })}
            icon={<Icon element={MdEdit} />}
          >
            {t('edit')}
          </DropdownElement>
        ),
      ]}
      customFilters={filters}
      defaultCustomFilterValues={TAG_ENTITY_TYPE_VALUES}
      customFilterPlaceholder="type"
      linkToCreate="/settings/tags/create"
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

        <TagsTable />
      </div>
    </Settings>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useHandleChange } from '../common/hooks/useHandleChange';
import { useEffect, useState } from 'react';
import { GroupSettings } from '$app/common/interfaces/group-settings';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GroupSettingsForm } from '../common/components/GroupSettingsForm';
import { Settings } from '$app/components/layouts/Settings';
import { useTitle } from '$app/common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { useParams } from 'react-router-dom';
import { useGroupQuery } from '$app/common/queries/group-settings';
import { useHandleUpdate } from '../common/hooks/useHandleUpdate';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks/useActions';
import { Upload } from '../../company/documents/components';
import { endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { TabGroup } from '$app/components/TabGroup';
import { Card } from '$app/components/cards';
import { Clients } from './components/Clients';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Settings as SettingsIcon } from 'react-feather';
import { useConfigureGroupSettings } from '../common/hooks/useConfigureGroupSettings';
import { $refetch } from '$app/common/hooks/useRefetch';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();

  const { documentTitle } = useTitle('edit_group');

  const { data: groupSettingsResponse } = useGroupQuery({ id });

  const actions = useActions();
  const colors = useColorScheme();

  const configureGroupSettings = useConfigureGroupSettings();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('group_settings'), href: '/settings/group_settings' },
    {
      name: t('edit_group'),
      href: route('/settings/group_settings/:id/edit', { id }),
    },
  ];

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const [groupSettings, setGroupSettings] = useState<GroupSettings>();

  const handleChange = useHandleChange({
    setGroupSettings,
    setErrors,
  });

  const handleSave = useHandleUpdate({
    groupSettings,
    setErrors,
    isFormBusy,
    setIsFormBusy,
  });

  useEffect(() => {
    if (groupSettingsResponse) {
      setGroupSettings(groupSettingsResponse);
    }
  }, [groupSettingsResponse]);

  const onSuccess = () => {
    $refetch(['group_settings']);
  };

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        groupSettings && (
          <ResourceActions
            onSaveClick={handleSave}
            label={t('actions')}
            resource={groupSettings}
            actions={actions}
            disableSaveButton={isFormBusy || !groupSettings}
          />
        )
      }
    >
      <Card
        title={t('edit_group')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        headerClassName={classNames('px-4 sm:px-6', {
          'pt-4': currentTabIndex === 0,
          'pt-[1.4rem] pb-[0.425rem]': currentTabIndex !== 0,
        })}
        topRight={
          <>
            {groupSettingsResponse && currentTabIndex === 0 && (
              <Button
                behavior="button"
                onClick={() => configureGroupSettings(groupSettingsResponse)}
              >
                <Icon
                  className="h-4 w-4"
                  element={SettingsIcon}
                  color="white"
                />

                <span>{t('configure_settings')}</span>
              </Button>
            )}
          </>
        }
        withoutHeaderBorder
        withoutHeaderPadding
      >
        <TabGroup
          tabs={[t('overview'), t('clients'), t('documents')]}
          formatTabLabel={(tabIndex) => {
            if (tabIndex === 2) {
              return (
                <DocumentsTabLabel
                  numberOfDocuments={groupSettings?.documents.length}
                />
              );
            }
          }}
          onTabChange={(tabIndex) => setCurrentTabIndex(tabIndex)}
          withHorizontalPadding
          fullRightPadding
          horizontalPaddingWidth="1.5rem"
        >
          <div>
            {groupSettings && groupSettingsResponse && (
              <GroupSettingsForm
                groupSettings={groupSettings}
                handleChange={handleChange}
                errors={errors}
              />
            )}
          </div>

          <div>
            <Clients />
          </div>

          <div className="px-4 sm:px-6 pt-3">
            <Upload
              endpoint={endpoint('/api/v1/group_settings/:id/upload', {
                id,
              })}
              onSuccess={onSuccess}
              widgetOnly
            />

            <DocumentsTable
              documents={groupSettings?.documents || []}
              onDocumentDelete={onSuccess}
            />
          </div>
        </TabGroup>
      </Card>
    </Settings>
  );
}

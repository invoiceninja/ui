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
import { FormEvent, useEffect, useState } from 'react';
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
import { useQueryClient } from 'react-query';
import { TabGroup } from '$app/components/TabGroup';
import { Divider } from '$app/components/cards/Divider';
import { Card } from '$app/components/cards';
import { GroupSettingsProperties } from '../common/components/GroupSettingsProperties';
import classNames from 'classnames';
import { Clients } from './components/Clients';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Settings as SettingsIcon } from 'react-feather';
import { useConfigureGroupSettings } from '../common/hooks/useConfigureGroupSettings';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { documentTitle } = useTitle('edit_group');

  const { data: groupSettingsResponse } = useGroupQuery({ id });

  const actions = useActions();

  const configureGroupSettings = useConfigureGroupSettings();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('group_settings'), href: '/settings/group_settings' },
    {
      name: t('edit_group'),
      href: route('/settings/group_settings/:id/edit', { id }),
    },
  ];

  const [groupSettings, setGroupSettings] = useState<GroupSettings>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

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

  const getShouldShowProperties = () => {
    const filteredProperties = Object.keys(
      groupSettings?.settings || []
    ).filter((key) => key !== 'entity');

    return Boolean(filteredProperties.length);
  };

  const onSuccess = () => {
    queryClient.invalidateQueries(route('/api/v1/group_settings/:id', { id }));
  };

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={handleSave}
      disableSaveButton={isFormBusy || !groupSettings}
      navigationTopRight={
        groupSettings && (
          <ResourceActions
            label={t('more_actions')}
            resource={groupSettings}
            actions={actions}
          />
        )
      }
    >
      <TabGroup tabs={[t('overview'), t('clients'), t('documents')]}>
        <div>
          {groupSettings && groupSettingsResponse && (
            <Card
              title={t('edit_group')}
              topRight={
                <Button
                  onClick={(event: FormEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    configureGroupSettings(groupSettingsResponse);
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    element={SettingsIcon}
                    color="white"
                  />

                  <span>{t('configure_settings')}</span>
                </Button>
              }
            >
              <div
                className={classNames({
                  'pb-4': getShouldShowProperties(),
                })}
              >
                <GroupSettingsForm
                  groupSettings={groupSettings}
                  handleChange={handleChange}
                  errors={errors}
                />
              </div>

              {getShouldShowProperties() && (
                <>
                  <Divider withoutPadding />

                  <GroupSettingsProperties
                    groupSettings={groupSettings}
                    handleChange={handleChange}
                  />
                </>
              )}
            </Card>
          )}
        </div>

        <div>
          <Clients />
        </div>

        <div>
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
    </Settings>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankGateway, useHandleChange } from '../common/hooks/useHandleChange';
import { useEffect, useState } from 'react';
import { GroupSettings } from '$app/common/interfaces/group-settings';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GroupSettingsForm } from '../common/components/GroupSettingsForm';
import { Settings } from '$app/components/layouts/Settings';
import { useTitle } from '$app/common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { useHandleCreate } from '../common/hooks/useHandleCreate';

export function Create() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('create_group');

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('group_settings'), href: '/settings/group_settings' },
    { name: t('create_group'), href: '/settings/group_settings/create' },
  ];

  const [groupSettings, setGroupSettings] = useState<GroupSettings>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = useHandleChange({
    setGroupSettings,
    setErrors,
    isCreatePage: true,
  });

  const handleSave = useHandleCreate({
    groupSettings,
    setErrors,
    isFormBusy,
    setIsFormBusy,
  });

  useEffect(() => {
    setGroupSettings(blankGateway);
  }, []);

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={handleSave}
      disableSaveButton={isFormBusy || !groupSettings}
    >
      {groupSettings && (
        <GroupSettingsForm
          page="create"
          groupSettings={groupSettings}
          handleChange={handleChange}
          errors={errors}
        />
      )}
    </Settings>
  );
}

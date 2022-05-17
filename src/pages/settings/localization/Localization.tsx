/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { CustomLabels, Settings as SettingsComponent } from './components';

export function Localization() {
  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('localization'), href: '/settings/localization' },
  ];

  useTitle('localization');

  const onSave = useHandleCompanySave(setErrors);
  const onCancel = useDiscardChanges();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('localization')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#localization"
    >
      <SettingsComponent errors={errors} />
      <CustomLabels />
    </Settings>
  );
}

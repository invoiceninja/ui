/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Tabs } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useLocalizationTabs } from './common/hooks/useLocalizationTabs';

export function Localization() {
  const [t] = useTranslation();

  useTitle('localization');

  const tabs = useLocalizationTabs();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('localization'), href: '/settings/localization' },
  ];

  const onSave = useHandleCompanySave();

  const onCancel = useDiscardChanges();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('localization')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#localization"
    >
      <Tabs tabs={tabs} className="mt-6" />
      <div className="my-4">
        <Outlet />
      </div>
    </Settings>
  );
}

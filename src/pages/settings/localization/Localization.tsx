/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { useTitle } from '$app/common/hooks/useTitle';
import { Card } from '$app/components/cards';
import { Tabs } from '$app/components/Tabs';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { useLocalizationTabs } from './common/hooks/useLocalizationTabs';

export function Localization() {
  const [t] = useTranslation();

  useTitle('localization');

  const colors = useColorScheme();
  const tabs = useLocalizationTabs();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('localization'), href: '/settings/localization' },
  ];

  const onCancel = useDiscardChanges();
  const onSave = useHandleCompanySave();

  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('localization')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#localization"
      disableSaveButton={isFormBusy}
    >
      <Card
        className="shadow-sm"
        title={t('localization')}
        withoutBodyPadding
        withoutHeaderBorder
        style={{ borderColor: colors.$24 }}
      >
        <Tabs
          tabs={tabs}
          withHorizontalPadding
          fullRightPadding
          withHorizontalPaddingOnSmallScreen
        />

        <div className="pt-4 pb-8">
          <Outlet />
        </div>
      </Card>
    </Settings>
  );
}

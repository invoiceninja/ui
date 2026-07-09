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
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { Card } from '$app/components/cards';
import { Tab, Tabs } from '$app/components/Tabs';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { useAccountManagementTabs } from './common/hooks/useAccountManagementTabs';

export function AccountManagement() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
  ];

  useTitle('account_management');
  useInjectCompanyChanges();

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  const tabs: Tab[] = useAccountManagementTabs();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('account_management')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#account_management"
      disableSaveButton={isFormBusy}
    >
      <Card
        title={t('account_management')}
        className="shadow-sm pb-6"
        withoutBodyPadding
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        withoutHeaderBorder
      >
        <Tabs
          tabs={tabs}
          withHorizontalPadding
          horizontalPaddingWidth="1.5rem"
          fullRightPadding
          withHorizontalPaddingOnSmallScreen
        />

        <div className="pt-4">
          <Outlet />
        </div>
      </Card>
    </Settings>
  );
}

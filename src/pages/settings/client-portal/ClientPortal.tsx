/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { useTabs } from './common/hooks/useTabs';
import { Tabs } from '$app/components/Tabs';
import { Outlet } from 'react-router-dom';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { useAtomValue } from 'jotai';

export function ClientPortal() {
  useTitle('client_portal');

  const [t] = useTranslation();

  useInjectCompanyChanges();
  const onCancel = useDiscardChanges();
  const onSave = useHandleCompanySave();

  const tabs = useTabs();
  const colors = useColorScheme();
  const showPlanAlert = useShouldDisableAdvanceSettings();

  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('client_portal'), href: '/settings/client_portal' },
  ];

  return (
    <Settings
      title={t('client_portal')}
      docsLink="en/advanced-settings/#client_portal"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert || isFormBusy}
    >
      <AdvancedSettingsPlanAlert />

      <Card
        title={t('client_portal')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        withoutBodyPadding
        withoutHeaderBorder
      >
        <Tabs
          tabs={tabs}
          withHorizontalPadding
          horizontalPaddingWidth="1.5rem"
          fullRightPadding
          withHorizontalPaddingOnSmallScreen
        />

        <div className="pt-4 pb-6">
          <Outlet />
        </div>
      </Card>
    </Settings>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { Tabs } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useGeneratedNumbersTabs } from './common/hooks/useGeneratedNumbersTabs';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';

export function GeneratedNumbers() {
  useTitle('generated_numbers');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('generated_numbers'), href: '/settings/generated_numbers' },
  ];

  useInjectCompanyChanges();

  const colors = useColorScheme();
  const tabs = useGeneratedNumbersTabs();
  const showPlanAlert = useShouldDisableAdvanceSettings();

  const onCancel = useDiscardChanges();
  const onSave = useHandleCompanySave();

  return (
    <Settings
      title={t('generated_numbers')}
      docsLink="en/advanced-settings/#generated_numbers"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert}
    >
      <AdvancedSettingsPlanAlert />

      <Card
        title={t('generated_numbers')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        withoutBodyPadding
        withoutHeaderBorder
      >
        <Tabs
          tabs={tabs}
          withHorizontalPadding
          horizontalPaddingWidth="1.5rem"
          withHorizontalPaddingOnSmallScreen
          fullRightPadding
        />

        <div className="pt-4 pb-6">
          <Outlet />
        </div>
      </Card>
    </Settings>
  );
}

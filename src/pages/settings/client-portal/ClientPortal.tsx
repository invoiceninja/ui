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
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useTabs } from './common/hooks/useTabs';
import { Tabs } from '$app/components/Tabs';
import { Outlet } from 'react-router-dom';

export function ClientPortal() {
  useTitle('client_portal');

  useInjectCompanyChanges();

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('client_portal'), href: '/settings/client_portal' },
  ];

  const onSave = useHandleCompanySave();

  const onCancel = useDiscardChanges();

  const showPlanAlert = useShouldDisableAdvanceSettings();

  const tabs = useTabs();

  return (
    <Settings
      title={t('client_portal')}
      docsLink="en/advanced-settings/#client_portal"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert}
      withoutBackButton
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <Tabs tabs={tabs} className="mt-6" />

      <div className="my-4">
        <Outlet />
      </div>
    </Settings>
  );
}

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
import { TabGroup } from '$app/components/TabGroup';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import {
  Authorization,
  Customize,
  Messages,
  Registration,
  Settings as SettingsComponent,
} from './components';

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

  const tabs = [
    t('settings'),
    t('authorization'),
    t('registration'),
    t('messages'),
    t('customize'),
  ];

  return (
    <Settings
      title={t('client_portal')}
      docsLink="docs/advanced-settings/#client_portal"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert}
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <TabGroup tabs={tabs}>
        <div>
          <SettingsComponent />
        </div>

        <div>
          <Authorization />
        </div>

        <div>
          <Registration />
        </div>

        <div>
          <Messages />
        </div>

        <div>
          <Customize />
        </div>
      </TabGroup>
    </Settings>
  );
}

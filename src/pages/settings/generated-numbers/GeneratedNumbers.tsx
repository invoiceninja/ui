/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { enterprisePlan } from 'common/guards/guards/enterprise-plan';
import { proPlan } from 'common/guards/guards/pro-plan';
import { isHosted } from 'common/helpers';
import { useTitle } from 'common/hooks/useTitle';
import { AdvancedSettingsPlanAlert } from 'components/AdvancedSettingsPlanAlert';
import { Tabs } from 'components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useGeneratedNumbersTabs } from './common/hooks/useGeneratedNumbersTabs';

export function GeneratedNumbers() {
  useTitle('generated_numbers');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('generated_numbers'), href: '/settings/generated_numbers' },
  ];

  const tabs = useGeneratedNumbersTabs();

  const onSave = useHandleCompanySave();

  const onCancel = useDiscardChanges();

  const showPlanAlert = !proPlan() && !enterprisePlan() && isHosted();

  return (
    <Settings
      title={t('generated_numbers')}
      docsLink="docs/advanced-settings/#generated_numbers"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert}
    >
      <Tabs tabs={tabs} className="mt-6" />

      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <div className="my-4">
        <Outlet />
      </div>
    </Settings>
  );
}

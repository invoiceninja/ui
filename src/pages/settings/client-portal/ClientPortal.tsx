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
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { AdvancedSettingsPlanAlert } from 'components/AdvancedSettingsPlanAlert';
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

  return (
    <Settings
      title={t('client_portal')}
      docsLink="docs/advanced-settings/#client_portal"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={!proPlan() && !enterprisePlan() && isHosted()}
    >
      {!proPlan() && !enterprisePlan() && isHosted() && (
        <AdvancedSettingsPlanAlert />
      )}

      <SettingsComponent />
      <Authorization />
      <Registration />
      <Messages />
      <Customize />
    </Settings>
  );
}

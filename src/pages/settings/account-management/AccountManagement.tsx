/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { Tab, Tabs } from 'components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useAccountManagementTabs } from './common/hooks/useAccountManagementTabs';

export function AccountManagement() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
  ];

  useTitle('account_management');
  useInjectCompanyChanges();

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  const tabs: Tab[] = useAccountManagementTabs();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('account_management')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#account_management"
    >
      <Tabs tabs={tabs} className="mt-6" />

      <div className="my-4">
        <Outlet />
      </div>
    </Settings>
  );
}

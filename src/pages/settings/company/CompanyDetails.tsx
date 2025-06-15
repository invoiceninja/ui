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
import { useTitle } from '$app/common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { Tabs } from '$app/components/Tabs';
import { Outlet } from 'react-router-dom';
import { useCompanyDetailsTabs } from './common/hooks/useCompanyDetailsTabs';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { useAtomValue } from 'jotai';

export function CompanyDetails() {
  const [t] = useTranslation();

  useInjectCompanyChanges();

  useTitle('company_details');

  const colors = useColorScheme();
  const tabs = useCompanyDetailsTabs();

  const onCancel = useDiscardChanges();
  const onSave = useHandleCompanySave();

  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
  ];

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('company_details')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#company_details"
      disableSaveButton={isFormBusy}
    >
      <Card
        className="shadow-sm"
        title={t('company')}
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

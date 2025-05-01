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
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { Tabs } from '$app/components/Tabs';
import { Outlet } from 'react-router-dom';
import { useCompanyDetailsTabs } from './common/hooks/useCompanyDetailsTabs';
import { Card } from '$app/components/cards';

export function CompanyDetails() {
  const [t] = useTranslation();

  useTitle('company_details');

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
  ];

  const onSave = useHandleCompanySave();

  const onCancel = useDiscardChanges();

  const tabs = useCompanyDetailsTabs();

  useInjectCompanyChanges();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('company_details')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#company_details"
    >
      <Card title={t('company')} withoutBodyPadding>
        <Tabs tabs={tabs} />

        <div className="my-4">
          <Outlet />
        </div>
      </Card>
    </Settings>
  );
}

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
import { CompanyDetailsTabs } from 'common/interfaces/company-details';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { Address, Defaults, Details, Logo, TabSection } from './components';
import { Documents } from './documents/Documents';

export function CompanyDetails() {
  const [t] = useTranslation();

  useTitle('company_details');

  const [tabsActivity, setTabsActivity] = useState<CompanyDetailsTabs>({
    details: true,
    address: false,
    logo: false,
    defaults: false,
    documents: false,
    custom_fields: false,
  });

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
  ];

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  useInjectCompanyChanges();

  const handleChangeTab = (property: string) => {
    const currentActiveTabKey = Object.keys(tabsActivity).filter(
      (key) => tabsActivity[key as keyof typeof tabsActivity] === true
    )[0];
    setTabsActivity((prevState) => ({
      ...prevState,
      [currentActiveTabKey]: false,
      [property]: true,
    }));
  };

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('company_details')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#company_details"
    >
      <TabSection
        handleChangeTab={handleChangeTab}
        tabsActivity={tabsActivity}
      />
      {tabsActivity.details && <Details />}
      {tabsActivity.logo && <Logo />}
      {tabsActivity.address && <Address />}
      {tabsActivity.defaults && <Defaults />}
      {tabsActivity.documents && <Documents />}
    </Settings>
  );
}

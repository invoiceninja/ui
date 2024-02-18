/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useDocumentsQuery } from '$app/common/queries/documents';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';

export function useCompanyDetailsTabs() {
  const { t } = useTranslation();

  const { data } = useDocumentsQuery({
    companyDocuments: 'true',
  });

  const { isGroupSettingsActive, isClientSettingsActive } =
    useCurrentSettingsLevel();

  let tabs: Tab[] = [
    { name: t('details'), href: '/settings/company_details' },
    { name: t('address'), href: '/settings/company_details/address' },
    {
      name: t('logo'),
      href: '/settings/company_details/logo',
    },
    {
      name: t('defaults'),
      href: '/settings/company_details/defaults',
    },
    {
      name: t('documents'),
      href: '/settings/company_details/documents',
      formatName: () => (
        <DocumentsTabLabel
          numberOfDocuments={data?.data?.meta.pagination.total}
        />
      ),
    },
    {
      name: t('custom_fields'),
      href: '/settings/company_details/custom_fields',
    },
  ];

  if (isGroupSettingsActive || isClientSettingsActive) {
    tabs = tabs.filter(
      (tab) => tab.name !== t('custom_fields') && tab.name !== t('documents')
    );
  }

  return tabs;
}

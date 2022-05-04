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
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { Address, Defaults, Details, Documents, Logo } from './components';

export function CompanyDetails() {
  const [t] = useTranslation();

  useTitle('company_details');

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
  ];

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  useInjectCompanyChanges();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('company_details')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#company_details"
    >
      <Details />
      <Logo />
      <Address />
      <Defaults />
      <Documents />
    </Settings>
  );
}

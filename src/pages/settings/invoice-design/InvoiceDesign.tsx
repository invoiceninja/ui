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
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import {
  GeneralSettings,
  ClientDetails,
  CompanyDetails,
  CompanyAddress,
  InvoiceDetails,
  CreditDetails,
  QuoteDetails,
  ProductColumns,
  TaskColumns,
  TotalFields,
} from './components';
import { PurchaseOrderDetails } from './components/PurchaseOrderDetails';
import { VendorDetails } from './components/VendorDetails';

export function InvoiceDesign() {
  useTitle('invoice_design');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('invoice_design'), href: '/settings/invoice_design' },
  ];

  const onSave = useHandleCompanySave();

  const onCancel = useDiscardChanges();

  return (
    <Settings
      title={t('invoice_design')}
      docsLink="docs/advanced-settings/#invoice_design"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={!proPlan() && !enterprisePlan() && isHosted()}
    >
      {!proPlan() && !enterprisePlan() && isHosted() && (
        <AdvancedSettingsPlanAlert />
      )}

      <GeneralSettings />
      <ClientDetails />
      <CompanyDetails />
      <CompanyAddress />
      <InvoiceDetails />
      <QuoteDetails />
      <CreditDetails />
      <VendorDetails />
      <PurchaseOrderDetails />
      <ProductColumns />
      <TaskColumns />
      <TotalFields />
    </Settings>
  );
}

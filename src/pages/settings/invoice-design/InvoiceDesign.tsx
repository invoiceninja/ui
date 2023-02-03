/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useShouldDisableAdvanceSettings } from 'common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from 'common/hooks/useTitle';
import { AdvancedSettingsPlanAlert } from 'components/AdvancedSettingsPlanAlert';
import { TabGroup } from 'components/TabGroup';
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

  const showPlanAlert = useShouldDisableAdvanceSettings();

  const tabs = [
    t('general_settings'),
    t('client_details'),
    t('company_details'),
    t('company_address'),
    t('invoice_details'),
    t('quote_details'),
    t('credit_details'),
    t('vendor_details'),
    t('purchase_order_details'),
    t('product_columns'),
    t('task_columns'),
    t('total_fields'),
  ];

  return (
    <Settings
      title={t('invoice_design')}
      docsLink="docs/advanced-settings/#invoice_design"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert}
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <TabGroup tabs={tabs}>
        <div>
          <GeneralSettings />
        </div>

        <div>
          <ClientDetails />
        </div>

        <div>
          <CompanyDetails />
        </div>

        <div>
          <CompanyAddress />
        </div>

        <div>
          <InvoiceDetails />
        </div>

        <div>
          <QuoteDetails />
        </div>

        <div>
          <CreditDetails />
        </div>

        <div>
          <VendorDetails />
        </div>

        <div>
          <PurchaseOrderDetails />
        </div>

        <div>
          <ProductColumns />
        </div>

        <div>
          <TaskColumns />
        </div>

        <div>
          <TotalFields />
        </div>
      </TabGroup>
    </Settings>
  );
}

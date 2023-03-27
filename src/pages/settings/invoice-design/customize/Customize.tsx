/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Card } from '$app/components/cards';
import { Default } from '$app/components/layouts/Default';
import { TabGroup } from '$app/components/TabGroup';
import {
  ClientDetails,
  CompanyAddress,
  CompanyDetails,
  CreditDetails,
  GeneralSettings,
  InvoiceDetails,
  ProductColumns,
  PurchaseOrderDetails,
  QuoteDetails,
  TaskColumns,
  TotalFields,
  VendorDetails,
} from '$app/pages/settings/invoice-design/components';
import { useTranslation } from 'react-i18next';

export function Customize() {
  const { documentTitle } = useTitle('customize_and_preview');
  const { t } = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    {
      name: t('customize_and_preview'),
      href: '/settings/invoice_design/customize',
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <TabGroup tabs={[t('settings'), t('template')]}>
            <div className="space-y-2">
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
            </div>

            <div>Template</div>
          </TabGroup>
        </div>

        <div className="border-2 rounded p-4 h-96 flex justify-center items-center">
          <p className="text-gray-600 uppercase text-sm">Preview goes here</p>
        </div>
      </div>
    </Default>
  );
}

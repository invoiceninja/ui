/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClientDetails } from './components/ClientDetails';
import { CompanyAddress } from './components/CompanyAddress';
import { CompanyDetails } from './components/CompanyDetails';
import { CreditDetails } from './components/CreditDetails';
import { GeneralSettings as InvoiceGeneralSettings } from './components/GeneralSettings';
import { InvoiceDetails } from './components/InvoiceDetails';
import { ProductColumns } from './components/ProductColumns';
import { ProductQuoteColumns } from './components/ProductQuoteColumns';
import { PurchaseOrderDetails } from './components/PurchaseOrderDetails';
import { QuoteDetails } from './components/QuoteDetails';
import { TaskColumns } from './components/TaskColumns';
import { TotalFields } from './components/TotalFields';
import { VendorDetails } from './components/VendorDetails';

export default function GeneralSettings() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 my-2">
      <div className="w-full lg:w-1/2 overflow-y-auto">
        <div className="space-y-4 max-h-[80vh] pl-1 py-2 pr-2">
          <InvoiceGeneralSettings />
          <ClientDetails />
          <CompanyDetails />
          <CompanyAddress />
          <InvoiceDetails />
          <QuoteDetails />
          <CreditDetails />
          <VendorDetails />
          <PurchaseOrderDetails />
          <ProductColumns />
          <ProductQuoteColumns />
          <TaskColumns />
          <TotalFields />
        </div>
      </div>

      {/* <div className="w-full lg:w-1/2 max-h-[82.5vh] overflow-y-scroll"> */}
        {/* <InvoiceViewer
          link={endpoint('/api/v1/live_design')}
          // resource={payload}
          method="POST"
          withToast
        /> */}
      {/* </div> */}
    </div>
  );
}

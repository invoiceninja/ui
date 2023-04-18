/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DataTable } from '$app/components/DataTable';

export default function CustomDesigns() {
  return (
    <div className="my-4">
      <DataTable
        endpoint="/api/v1/designs?custom=true"
        columns={[{ id: 'name', label: 'Name' }]}
        resource="design"
        linkToCreate="/settings/invoice_design/custom_designs/create"
        bulkRoute="/api/v1/designs/bulk"
        linkToEdit="/settings/invoice_design/custom_designs/:id/edit"
        withResourcefulActions
      />
    </div>
  );
}

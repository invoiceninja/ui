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
import { useTaxRateColumns } from './common/hooks/useTaxRateColumns';

export function TaxRates() {
  const columns = useTaxRateColumns();

  return (
    <DataTable
      resource="tax_rate"
      endpoint="/api/v1/tax_rates"
      columns={columns}
      linkToCreate="/settings/tax_rates/create"
      linkToEdit="/settings/tax_rates/:id/edit"
      withResourcefulActions
    />
  );
}

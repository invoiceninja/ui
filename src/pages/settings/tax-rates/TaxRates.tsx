/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { DataTable } from '$app/components/DataTable';
import { cloneDeep } from 'lodash';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { useTaxRateColumns } from './common/hooks/useTaxRateColumns';

export function TaxRates() {
  const company = useCurrentCompany();
  const columns = useTaxRateColumns();

  const companyChanges = useCompanyChanges();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const handleCompanySave = useHandleCompanySave();

  const bulkActionsSuccess = (taxRates: TaxRate[]) => {
    const updatedCompanySettingsChanges = cloneDeep(companyChanges?.settings);

    console.log(updatedCompanySettingsChanges);

    taxRates.forEach(({ name }) => {
      if (company?.settings.tax_name1 === name) {
        updatedCompanySettingsChanges.tax_name1 = '';
        updatedCompanySettingsChanges.tax_rate1 = 0;
      }

      if (company?.settings.tax_name2 === name) {
        updatedCompanySettingsChanges.tax_name2 = '';
        updatedCompanySettingsChanges.tax_rate2 = 0;
      }

      if (company?.settings.tax_name3 === name) {
        updatedCompanySettingsChanges.tax_name3 = '';
        updatedCompanySettingsChanges.tax_rate3 = 0;
      }
    });

    console.log(updatedCompanySettingsChanges);

    handleChange('settings', updatedCompanySettingsChanges);

    handleCompanySave();
  };

  return (
    <DataTable
      resource="tax_rate"
      endpoint="/api/v1/tax_rates?sort=id|desc&per_page=100"
      bulkRoute="/api/v1/tax_rates/bulk"
      columns={columns}
      linkToCreate="/settings/tax_rates/create"
      linkToEdit="/settings/tax_rates/:id/edit"
      withResourcefulActions
      onBulkSuccess={bulkActionsSuccess}
    />
  );
}

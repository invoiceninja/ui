/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import {
  resetChanges,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { DataTable } from '$app/components/DataTable';
import { useTaxRateColumns } from './common/hooks/useTaxRateColumns';

export function TaxRates() {
  const dispatch = useDispatch();
  const columns = useTaxRateColumns();

  const onBulkActionsSuccess = (action: 'archive' | 'delete' | 'restore') => {
    if (action === 'archive' || action === 'delete') {
      request(
        'POST',
        endpoint('/api/v1/refresh?updated_at=:updatedAt', {
          updatedAt: dayjs().unix(),
        })
      ).then((response) => {
        dispatch(updateCompanyUsers(response.data.data));
        dispatch(resetChanges('company'));
      });
    }
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
      onBulkActionSuccess={(_, action) => onBulkActionsSuccess(action)}
      enableSavingFilterPreference
    />
  );
}

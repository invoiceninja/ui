/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, RefObject, SetStateAction } from 'react';
import { endpoint } from '../helpers';
import { request } from '../helpers/request';
import { toast } from '../helpers/toast/toast';
import { GenericSingleResourceResponse } from '../interfaces/generic-api-response';
import { refetchByUrl } from './useRefetch';

interface Params<T> {
  resourceIds: string[];
  apiEndpoint: URL;
  endpoint: string;
  bulkRoute: string | undefined;
  resource: string;
  onBulkActionSuccess?: (
    resource: T[],
    action: 'archive' | 'delete' | 'restore'
  ) => void;
  setSelected: Dispatch<SetStateAction<string[]>>;
  bulkActionCheckbox: RefObject<HTMLInputElement>;
}

export function useDataTableBulk<T>(params: Params<T>) {
  const {
    bulkRoute,
    resource,
    onBulkActionSuccess,
    resourceIds,
    setSelected,
    apiEndpoint,
    bulkActionCheckbox,
  } = params;

  return (action: 'archive' | 'restore' | 'delete', id?: string) => {
    toast.processing();

    request('POST', endpoint(bulkRoute ?? `${params.endpoint}/bulk`), {
      action,
      ids: id ? [id] : Array.from(resourceIds),
    })
      .then((response: GenericSingleResourceResponse<T[]>) => {
        toast.success(`${action}d_${resource}`);

        onBulkActionSuccess?.(response.data.data, action);

        if (bulkActionCheckbox.current) {
          bulkActionCheckbox.current.checked = false;
        }
      })
      .finally(() => {
        refetchByUrl([params.endpoint, apiEndpoint.pathname]);
        setSelected([]);
      });
  };
}

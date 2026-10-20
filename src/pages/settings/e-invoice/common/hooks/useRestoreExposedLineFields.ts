/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { isEqual } from 'lodash';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Company } from '$app/common/interfaces/company.interface';
import {
  getExposedLinePaths,
  withExposedLinePaths,
} from '$app/components/e-invoice/line-fields/fields';

export function useRestoreExposedLineFields() {
  const company = useCurrentCompany();

  return async (paths: string[]) => {
    if (!paths.length || !company?.id) {
      return;
    }

    const url = endpoint('/api/v1/companies/:id', { id: company.id });

    try {
      const current: Company = await request('GET', url).then(
        (response: AxiosResponse) => response.data.data
      );

      if (isEqual(getExposedLinePaths(current.e_invoice), paths)) {
        return;
      }

      await request('PUT', url, {
        ...current,
        e_invoice: withExposedLinePaths(current.e_invoice, paths),
      });
    } catch {
      toast.error();
    }
  };
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isEmpty, isEqual } from 'lodash';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Company } from '$app/common/interfaces/company.interface';
import {
  EInvoiceLineEntry,
  getLineTemplate,
  getTemplatePaths,
  withLineTemplate,
} from '$app/components/e-invoice/line-fields/fields';

export function useRestoreLineTemplate() {
  const company = useCurrentCompany();

  return async (template: EInvoiceLineEntry) => {
    if (isEmpty(template) || !company?.id) {
      return;
    }

    try {
      const response = await request(
        'GET',
        endpoint('/api/v1/companies/:id', { id: company.id })
      );
      const current: Company = response.data.data;

      if (
        isEqual(
          getTemplatePaths(getLineTemplate(current.e_invoice)),
          getTemplatePaths(template)
        )
      ) {
        return;
      }

      await request(
        'PUT',
        endpoint('/api/v1/companies/:id', { id: company.id }),
        {
          ...current,
          e_invoice: withLineTemplate(current.e_invoice, template),
        }
      );
    } catch {
      toast.error();
    }
  };
}

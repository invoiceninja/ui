/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from "common/helpers";
import { request } from "common/helpers/request";
import { GenericSingleResourceResponse } from "common/interfaces/generic-api-response";
import { RecurringInvoice } from "common/interfaces/recurring-invoice";
import { GenericQueryOptions } from "common/queries/invoices";
import { useQuery } from "react-query";
import { generatePath } from "react-router-dom";

interface RecurringInvoiceQueryParams {
  id: string;
}

export function useRecurringInvoiceQuery(params: RecurringInvoiceQueryParams) {
  return useQuery<RecurringInvoice>(
    generatePath("/api/v1/recurring_invoices/:id", { id: params.id }),
    () =>
      request(
        "GET",
        endpoint("/api/v1/recurring_invoices/:id", { id: params.id }),
      ).then((response: GenericSingleResourceResponse<RecurringInvoice>) =>
        response.data.data
      ),
    { staleTime: Infinity },
  );
}

export function useBlankRecurringInvoiceQuery(options?: GenericQueryOptions) {
  return useQuery<RecurringInvoice>(
    "/api/v1/recurring_invoice/create",
    () =>
      request("GET", endpoint("/api/v1/recurring_invoices/create")).then((
        response: GenericSingleResourceResponse<RecurringInvoice>,
      ) => response.data.data),
    { ...options, staleTime: Infinity },
  );
}

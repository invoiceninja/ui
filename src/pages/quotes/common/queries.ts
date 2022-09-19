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
import { Quote } from "common/interfaces/quote";
import { GenericQueryOptions } from "common/queries/invoices";
import { useQuery } from "react-query";

export function useBlankQuoteQuery(options?: GenericQueryOptions) {
  return useQuery<Quote>(
    "/api/v1/quotes/create",
    () =>
      request("GET", endpoint("/api/v1/quotes/create")).then((
        response: GenericSingleResourceResponse<Quote>,
      ) => response.data.data),
    { ...options, staleTime: Infinity },
  );
}

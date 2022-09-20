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
import { Credit } from "common/interfaces/credit";
import { GenericSingleResourceResponse } from "common/interfaces/generic-api-response";
import { GenericQueryOptions } from "common/queries/invoices";
import { useQuery } from "react-query";

export function useBlankCreditQuery(options?: GenericQueryOptions) {
  return useQuery<Credit>(
    "/api/v1/credits/create",
    () =>
      request("GET", endpoint("/api/v1/credits/create")).then((
        response: GenericSingleResourceResponse<Credit>,
      ) => response.data.data),
    { ...options, staleTime: Infinity },
  );
}

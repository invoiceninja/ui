/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import useSWR from "swr";
import { endpoint, fetcher } from "../helpers";
import { Params } from "./common/params.interface";

export function useProductsQuery(params: Params) {
  return useSWR(
    [
      "GET",
      endpoint(
        "/api/v1/products?per_page=:perPage&page=:currentPage&filter=:filter&status=:status&sort=:sort",
        {
          perPage: params.perPage,
          currentPage: params.currentPage,
          filter: params.filter,
          status: params.status,
          sort: params.sort ?? "id|asc",
        }
      ),
    ],
    fetcher
  );
}

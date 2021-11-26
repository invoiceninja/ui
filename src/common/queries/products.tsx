/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from "axios";
import useSWR from "swr";
import { endpoint, fetcher, request } from "../helpers";
import { Params } from "./common/params.interface";

export function useProductsQuery(params: Params) {
  return useSWR(
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
    fetcher
  );
}

export function useProductQuery(params: { id: string | undefined }) {
  return useSWR(endpoint("/api/v1/products/:id", params), fetcher);
}

export function bulk(
  id: string[],
  action: "archive" | "restore" | "delete"
): Promise<AxiosResponse> {
  return request(
    "POST",
    endpoint("/api/v1/products/bulk"),
    {
      action,
      ids: Array.from(id),
    },
    { "X-Api-Token": localStorage.getItem("X-NINJA-TOKEN") }
  );
}

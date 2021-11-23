/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { generatePath } from "react-router";
import { Params } from "./common/params.interface";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/v1`,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      headers.set("X-Requested-With", "XMLHttpRequest");
      headers.set(
        "X-Api-Token",
        localStorage.getItem("X-NINJA-TOKEN") as unknown as string
      );

      return headers;
    },
  }),
  endpoints: (builder) => ({
    products: builder.query({
      query: (args: Params) =>
        generatePath(
          "/products?per_page=:perPage&page=:currentPage&filter=:filter&status=:status",
          {
            perPage: (args.perPage as unknown as string) ?? 1,
            currentPage: (args.currentPage as unknown as string) ?? 1,
            filter: args.filter ?? "",
            status: args.status.join(),
          }
        ),
    }),
  }),
});

export const { useProductsQuery } = productsApi;

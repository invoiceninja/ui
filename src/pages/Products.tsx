/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { endpoint, request } from "../common/helpers";
import { Button } from "../components/forms/Button";
import { Checkbox } from "../components/forms/Checkbox";
import { Input } from "../components/forms/Input";
import { Default } from "../components/layouts/Default";
import Loading from "../components/icons/Loading";
import useSWR from "swr";
import classNames from "classnames";
import { Link } from "react-router-dom";

export function Products() {
  useEffect(() => {
    document.title = t("products");
  });

  const [t] = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState([1]);

  const { data, error } = useSWR(
    endpoint("/api/v1/products?page=:currentPage&per_page=10", { currentPage }),
    (url: string) => {
      return request(
        "GET",
        url,
        {},
        { "X-Api-Token": localStorage.getItem("X-NINJA-TOKEN") }
      )
        .then((response: AxiosResponse) => {
          setPages(
            Array.from(
              Array(response.data.meta.pagination.total_pages),
              (_, idx) => idx + 1
            )
          );

          return response.data;
        })
        .catch((error: AxiosError) => error.response?.data);
    }
  );

  return (
    <Default title={t("products")}>
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <Button variant="primary">{t("invoice")}</Button>
            <Button variant="secondary">{t("archive")}</Button>
          </div>
          <div className="flex items-center mt-3 space-x-3 ml-4 -mt-1">
            <Checkbox id="status.active" label={t("active")} />
            <Checkbox id="status.archived" label={t("archived")} />
            <Checkbox id="status.deleted" label={t("deleted")} />
          </div>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <Input placeholder={t("filter")} />
          <Button>{t("new_product")}</Button>
        </div>
      </div>

      <div className="py-2 align-middle inline-block w-full mt-4">
        <div className="overflow-hidden border border-gray-300 sm:rounded-lg overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col"></th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("product")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("description")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("price")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("quantity")}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t("view")}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!data && !error && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Loading variant="dark" />
                  </td>
                </tr>
              )}

              {data &&
                data.data.map((product: any) => (
                  <tr key={product.product_key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Checkbox />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.notes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex sm:justify-end">
              <div>
                {data?.meta?.pagination && (
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    {pages.map((i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        aria-current="page"
                        className={classNames(
                          "relative inline-flex items-center px-4 py-2 border text-sm font-medium ",
                          {
                            "z-10 bg-indigo-50 border-indigo-500 text-indigo-600":
                              currentPage === i,
                            "bg-white border-gray-300 text-gray-500 hover:bg-gray-50":
                              currentPage !== i,
                          }
                        )}
                      >
                        {i}
                      </button>
                    ))}
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
}

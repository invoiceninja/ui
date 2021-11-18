/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "../components/forms/Checkbox";
import { Default } from "../components/layouts/Default";
import { useProductsQuery } from "../common/queries/products";
import classNames from "classnames";
import { Link } from "react-router-dom";
import Loading from "../components/icons/Loading";
import { Actions } from "./products/Actions";

export function Products() {
  useEffect(() => {
    document.title = t("products");
  });

  const [t] = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useProductsQuery({
    perPage: 10,
    currentPage,
  });

  return (
    <Default title={t("products")}>
      <Actions />

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
              {isLoading && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Loading variant="dark" />
                  </td>
                </tr>
              )}

              {data &&
                data.data.map((product: any) => (
                  <tr key={product.id}>
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
          {data?.meta?.pagination && data?.meta?.pagination.total_pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex sm:justify-end">
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    {[...Array(data.meta.pagination.total_pages).keys()].map(
                      (i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          aria-current="page"
                          className={classNames(
                            "relative inline-flex items-center px-4 py-2 border text-sm font-medium ",
                            {
                              "z-10 bg-indigo-50 border-indigo-500 text-indigo-600":
                                currentPage === i + 1,
                              "bg-white border-gray-300 text-gray-500 hover:bg-gray-50":
                                currentPage !== i + 1,
                            }
                          )}
                        >
                          {i + 1}
                        </button>
                      )
                    )}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Default>
  );
}

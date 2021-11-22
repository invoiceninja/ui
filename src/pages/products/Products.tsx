/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useProductsQuery } from "../../common/queries/products";
import { RootState } from "../../common/stores/store";
import { Button } from "../../components/forms/Button";
import { Default } from "../../components/layouts/Default";
import Select from "react-select";
import { InputField } from "../../components/forms/InputField";
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "react-feather";
import { Link } from "../../components/forms/Link";

export function Products() {
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t("products")}`;
  });

  const [t] = useTranslation();

  const currentPage = useSelector(
    (state: RootState) => state.products.currentPage
  );

  const filter = useSelector((state: RootState) => state.products.filter);
  const colors = useSelector((state: RootState) => state.settings.colors);

  const options = [
    { value: "archive", label: "Active" },
    { value: "archived", label: "Archived" },
    { value: "deleted", label: "Deleted" },
  ];

  const { data, isLoading } = useProductsQuery({
    perPage: 10,
    currentPage,
    filter,
  });

  return (
    <Default title={t("products")}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Button>
            <span>{t("invoice")}</span>
            <CheckSquare size="20" />
          </Button>
          <Button type="secondary">{t("archive")}</Button>
          <Select
            defaultValue={options[0]}
            placeholder={t("status")}
            options={options}
            isMulti
          />
        </div>
        <div className="mt-2 md:mt-0 flex items-center space-x-4">
          <InputField id="filter" placeholder={t("filter")} />
          <Button>
            <span>{t("new_product")}</span>
            <PlusCircle size="20" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col mt-2">
        <div className="overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            <div className="overflow-hidden border border-gray-200 rounded border-b border-t">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ backgroundColor: colors.primary }}>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      <input type="checkbox" />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      {t("product")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      {t("notes")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      {t("cost")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    ></th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <input type="checkbox" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* <Link to="/edit">{t("edit")}</Link> */}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between space-x-2 my-3">
          <div className="flex justify-center md:justify-start items-center space-x-4">
            <span className="text-sm">Showing 1 to 1 of 1 entires</span>
            <div className="flex items-center space-x-2">
              <select
                id="location"
                name="location"
                className="block pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md"
                defaultValue="10"
              >
                <option>10</option>
                <option>50</option>
                <option>100</option>
              </select>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                {t("rows")}
              </label>
            </div>
          </div>
          <nav className="flex justify-center md:justify-end my-4 md:my-0 items-center">
            <a
              className="py-1.5 px-2 bg-white border-b border-t rounded-l hover:bg-gray-50 border"
              href="#"
            >
              <ChevronLeft />
            </a>
            <a
              className="py-1.5 px-4 bg-white border-b border-t hover:bg-gray-50"
              href="#"
            >
              1
            </a>
            <a
              className="py-1.5 px-4 bg-white border-b border-t text-white"
              href="#"
              style={{ backgroundColor: colors.primary }}
            >
              2
            </a>
            <a
              className="py-1.5 px-4 bg-white border-b border-t hover:bg-gray-50"
              href="#"
            >
              3
            </a>
            <a
              className="py-1.5 px-2 bg-white border-b border-t border-r rounded-r hover:bg-gray-50"
              href="#"
            >
              <ChevronRight />
            </a>
          </nav>
        </div>
      </div>
    </Default>
  );
}

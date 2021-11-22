/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CommonProps from "../../common/interfaces/common-props.interface";
import { RootState } from "../../common/stores/store";

interface Props extends CommonProps {}

export function Pagination(props: Props) {
  const [t] = useTranslation();
  const colors = useSelector((state: RootState) => state.settings.colors);

  return (
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
  );
}

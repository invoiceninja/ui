/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useProductsQuery } from "../../common/queries/products";
import { RootState } from "../../common/stores/store";
import { Button } from "../../components/forms/Button";
import { Default } from "../../components/layouts/Default";
import Select from "react-select";
import { InputField } from "../../components/forms/InputField";
import { CheckSquare, PlusCircle } from "react-feather";
import { Link } from "../../components/forms/Link";
import { Table } from "../../components/tables/Table";
import { Thead } from "../../components/tables/Thead";
import { Th } from "../../components/tables/Th";
import { Tbody } from "../../components/tables/Tbody";
import { Tr } from "../../components/tables/Tr";
import { Td } from "../../components/tables/Td";
import { Pagination } from "../../components/tables/Pagination";
import { Checkbox } from "../../components/forms/Checkbox";
import { generatePath } from "react-router";

export function Products() {
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t("products")}`;
  });

  const [t] = useTranslation();
  const filter = useSelector((state: RootState) => state.products.filter);
  const [currentPage, setCurrentPage] = useState(1);

  const options = [
    { value: "archive", label: "Active" },
    { value: "archived", label: "Archived" },
    { value: "deleted", label: "Deleted" },
  ];

  const { data, isLoading } = useProductsQuery({
    perPage: 1,
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

      <Table>
        <Thead>
          <Th>
            <Checkbox />
          </Th>
          <Th>{t("product")}</Th>
          <Th>{t("notes")}</Th>
          <Th>{t("cost")}</Th>
        </Thead>
        <Tbody>
          {data?.data.map((product: any) => {
            return (
              <Tr key={product.id} isLoading={isLoading}>
                <Td>
                  <Checkbox id={product.id} />
                </Td>
                <Td>
                  <Link
                    to={generatePath("/products/:id/edit", { id: product.id })}
                  >
                    {product.product_key}
                  </Link>
                </Td>
                <Td>{product.notes}</Td>
                <Td>{product.cost}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Pagination
        onPageChange={setCurrentPage}
        currentPage={currentPage}
        totalPages={data?.meta.pagination.total_pages}
      />
    </Default>
  );
}

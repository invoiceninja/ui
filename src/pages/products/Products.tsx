/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useProductsQuery } from "../../common/queries/products";
import { Default } from "../../components/layouts/Default";
import { Link } from "../../components/forms/Link";
import { Table } from "../../components/tables/Table";
import { Thead } from "../../components/tables/Thead";
import { ColumnSortPayload, Th } from "../../components/tables/Th";
import { Tbody } from "../../components/tables/Tbody";
import { Tr } from "../../components/tables/Tr";
import { Td } from "../../components/tables/Td";
import { Pagination } from "../../components/tables/Pagination";
import { Checkbox } from "../../components/forms/Checkbox";
import { generatePath } from "react-router";
import { Actions } from "../../components/datatables/Actions";
import { Button } from "../../components/forms/Button";
import { CheckSquare, PlusCircle } from "react-feather";
import { endpoint, fetcher, handleCheckboxChange } from "../../common/helpers";
import { Spinner } from "../../components/Spinner";
import axios, { Method } from "axios";
import useSWR from "swr";

export function Products() {
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t("products")}`;
  });

  const [t] = useTranslation();
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState("10");
  const [status, setStatus] = useState(["active"]);
  const [selected, setSelected] = useState(new Set());
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [sortedBy, setSortedBy] = useState<string | undefined>(undefined);

  const options = [
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
    { value: "deleted", label: "Deleted" },
  ];

  const { data, error } = useProductsQuery({
    perPage,
    currentPage,
    filter,
    status,
    sort,
  });

  return (
    <Default title={t("products")}>
      <Actions
        onStatusChange={setStatus}
        onFilterChange={setFilter}
        optionsMultiSelect={true}
        options={options}
        defaultOption={options[0]}
        rightSide={
          <Button>
            <span>{t("new_product")}</span>
            <PlusCircle size="20" />
          </Button>
        }
      >
        <Button>
          <span>{t("invoice")}</span>
          <CheckSquare size="20" />
        </Button>
        <Button type="secondary">{t("archive")}</Button>
      </Actions>
      <Table>
        <Thead>
          <Th></Th>
          <Th
            id="product_key"
            isCurrentlyUsed={sortedBy === "product_key"}
            onColumnClick={(data: ColumnSortPayload) => {
              setSortedBy(data.field);
              setSort(data.sort);
            }}
          >
            {t("product")}
          </Th>
          <Th
            id="notes"
            isCurrentlyUsed={sortedBy === "notes"}
            onColumnClick={(data: ColumnSortPayload) => {
              setSortedBy(data.field);
              setSort(data.sort);
            }}
          >
            {t("notes")}
          </Th>
          <Th
            id="cost"
            isCurrentlyUsed={sortedBy === "cost"}
            onColumnClick={(data: ColumnSortPayload) => {
              setSortedBy(data.field);
              setSort(data.sort);
            }}
          >
            {t("cost")}
          </Th>
        </Thead>
        <Tbody>
          {!data && (
            <Tr>
              <Td colSpan={100}>
                <Spinner />
              </Td>
            </Tr>
          )}

          {data?.data.map((product: any) => {
            return (
              <Tr key={product.id} isLoading={!data}>
                <Td>
                  <Checkbox
                    value={product.id}
                    id={product.id}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setSelected(
                        handleCheckboxChange(event.target.id, selected)
                      )
                    }
                  />
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
      {data && (
        <Pagination
          onRowsChange={setPerPage}
          onPageChange={setCurrentPage}
          currentPage={currentPage}
          totalPages={data?.meta.pagination.total_pages}
        />
      )}
    </Default>
  );
}

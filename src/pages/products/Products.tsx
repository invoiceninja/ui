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
import { CheckSquare, ChevronDown, Divide, PlusCircle } from "react-feather";
import { endpoint, handleCheckboxChange, request } from "../../common/helpers";
import { Spinner } from "../../components/Spinner";
import { AxiosError, AxiosResponse, Method } from "axios";
import { useSWRConfig } from "swr";
import { Alert } from "../../components/Alert";
import Tippy from "@tippyjs/react/headless";

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
  const { mutate, cache } = useSWRConfig();
  const [alert, setAlert] = useState<
    | {
        type?: "success" | "danger";
        message?: string;
      }
    | undefined
  >(undefined);

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

  function archive() {
    request(
      "POST",
      endpoint("/api/v1/products/bulk"),
      {
        action: "archive",
        ids: Array.from(selected),
      },
      { "X-Api-Token": localStorage.getItem("X-NINJA-TOKEN") }
    )
      .then((response: AxiosResponse) => {
        mutate(data?.request.responseURL);

        setAlert({
          message: generatePath(t("archived_invoices"), {
            count: response.data.data.length.toString(),
          }),
          type: "success",
        });

        selected.clear();
      })
      .catch((error: AxiosError) => console.error(error.response?.data));
  }

  return (
    <Default title={t("products")}>
      {alert && (
        <Alert className="mb-4" type={alert.type}>
          {alert.message}.
        </Alert>
      )}

      <Actions
        onStatusChange={setStatus}
        onFilterChange={setFilter}
        optionsMultiSelect={true}
        options={options}
        defaultOption={options[0]}
        rightSide={
          <Button to="/products/create">
            <span>{t("new_product")}</span>
            <PlusCircle size="20" />
          </Button>
        }
      >
        <Button>
          <span>{t("invoice")}</span>
          <CheckSquare size="20" />
        </Button>
        <Button onClick={archive} type="secondary">
          {t("archive")}
        </Button>
      </Actions>
      <Table>
        <Thead>
          <Th>
            <Checkbox
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                Array.from(
                  document.querySelectorAll(".child-checkbox")
                ).forEach((checkbox) => {
                  checkbox.checked = event.target.checked;

                  event.target.checked
                    ? selected.add(checkbox.id)
                    : selected.delete(checkbox.id);
                });
              }}
            />
          </Th>
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
          <Th />
        </Thead>
        <Tbody>
          {!data && (
            <Tr>
              <Td colSpan={100}>
                <Spinner />
              </Td>
            </Tr>
          )}

          {data?.data.data.length === 0 && (
            <Tr>
              <Td colSpan={100}>{t("no_results")}</Td>
            </Tr>
          )}

          {data?.data.data.map((product: any) => {
            return (
              <Tr key={product.id} isLoading={!data}>
                <Td>
                  <Checkbox
                    className="child-checkbox"
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
                <Td>
                  <Tippy
                    placement="bottom"
                    trigger="click"
                    interactive={true}
                    render={(attrs) => (
                      <div
                        className="divide-y box mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        tabIndex={-1}
                        {...attrs}
                      >
                        <div>
                          <button className="w-full text-left hover:bg-gray-100 z-50 block px-4 py-2 text-sm text-gray-700">
                            {t("edit_product")}
                          </button>

                          <button className="w-full text-left hover:bg-gray-100 z-50 block px-4 py-2 text-sm text-gray-700">
                            {t("clone_product")}
                          </button>

                          <button className="w-full text-left hover:bg-gray-100 z-50 block px-4 py-2 text-sm text-gray-700">
                            {t("invoice_product")}
                          </button>
                        </div>

                        <div>
                          <button className="w-full text-left hover:bg-gray-100 z-50 block px-4 py-2 text-sm text-gray-700">
                            {t("archive_product")}
                          </button>

                          <button className="w-full text-left hover:bg-gray-100 z-50 block px-4 py-2 text-sm text-gray-700">
                            {t("delete_product")}
                          </button>
                        </div>
                      </div>
                    )}
                  >
                    <button className="inline-flex  items-center space-x-2 bg-white border border-gray-300 rounded px-4 py-2">
                      <span>{t("select")}</span>
                      <ChevronDown size={14} />
                    </button>
                  </Tippy>
                </Td>
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
          totalPages={data?.data.meta.pagination.total_pages}
        />
      )}
    </Default>
  );
}

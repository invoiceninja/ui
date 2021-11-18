/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Product } from "../../common/dtos/product";
import { useProductsQuery } from "../../common/queries/products";
import { RootState } from "../../common/stores/store";
import { Button } from "../../components/forms/Button";
import { Checkbox } from "../../components/forms/Checkbox";
import Loading from "../../components/icons/Loading";
import { Default } from "../../components/layouts/Default";
import { Pagination } from "../../components/tables/Pagination";
import { Table, Tbody, Td, Th, Thead, Tr } from "../../components/tables/Table";
import { TableWrapper } from "../../components/tables/TableWrapper";
import { Actions } from "./components/Actions";

export function Products() {
  useEffect(() => {
    document.title = t("products");
  });

  const [t] = useTranslation();

  const currentPage = useSelector(
    (state: RootState) => state.products.currentPage
  );

  const filter = useSelector((state: RootState) => state.products.filter);
  const [selected, setSelected] = useState<string[]>([]);

  function checkboxHandler(event: ChangeEvent<HTMLInputElement>): void {
    selected.includes(event.target.value)
      ? setSelected(
          selected.filter((value, index, array) => value !== event.target.value)
        )
      : setSelected([...selected, event.target.value]);
  }

  const { data, isLoading } = useProductsQuery({
    perPage: 10,
    currentPage,
    filter,
  });

  return (
    <Default title={t("products")}>
      <Actions />
      <TableWrapper>
        <Table>
          <Thead>
            <Th></Th>
            <Th>{t("product")}</Th>
            <Th>{t("notes")}</Th>
            <Th>{t("cost")}</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            {isLoading && (
              <Tr>
                <Td>
                  <Loading />
                </Td>
              </Tr>
            )}

            {data &&
              data.data.map((product: Product) => (
                <Tr key={product.id}>
                  <Td>
                    <Checkbox value={product.id} onChange={checkboxHandler} />
                  </Td>
                  <Td>{product.product_key}</Td>
                  <Td>{product.notes}</Td>
                  <Td>{product.price}</Td>
                  <Td>
                    <Button variant="secondary">Actions</Button>
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
        {data?.meta.pagination && data?.meta.pagination.total_pages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={data.meta.pagination.total_pages}
          />
        )}
      </TableWrapper>
    </Default>
  );
}

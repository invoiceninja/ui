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
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useProductsQuery } from "../../common/queries/products";
import { RootState } from "../../common/stores/store";

export function Products() {
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t("products")}`;
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
  
  console.log(data, isLoading);

  return <div>
    Products page
  </div>;
}

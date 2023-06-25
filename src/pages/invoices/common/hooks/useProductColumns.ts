/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useState, useEffect } from 'react';
import { clone } from 'lodash';

export function useProductColumns() {
  const company = useCurrentCompany();
  const [columns, setColumns] = useState<string[]>([]);

  const getColumnIndex = (
    columnKey: string,
    pdfColumns: string[],
    currentColumns: string[]
  ) => {
    const columnIndex = pdfColumns.findIndex(
      (variable) => variable === columnKey
    );

    const adjustedColumnIndex =
      columnIndex > -1 ? columnIndex : currentColumns.length;

    return adjustedColumnIndex;
  };

  useEffect(() => {
    let updatedVariables: string[] =
      clone(company?.settings.pdf_variables.product_columns) || [];

    let pdfVariables =
      clone(company?.settings.pdf_variables.product_columns) || [];

    const numberOfPdfVariables = pdfVariables.length;

    if (!updatedVariables.includes('$product.item')) {
      updatedVariables.splice(0, 0, '$product.item');
      pdfVariables.splice(0, 0, '$product.item');
    }

    if (!numberOfPdfVariables) {
      updatedVariables.push('$product.description');
    }

    if (!updatedVariables.includes('$product.unit_cost')) {
      updatedVariables.push('$product.unit_cost');
      pdfVariables.push('$product.unit_cost');
    }

    if (!updatedVariables.includes('$product.quantity')) {
      updatedVariables.push('$product.quantity');
      pdfVariables.push('$product.quantity');
    }

    const taxes: string[] = [];
    const enabledTaxRates = company?.enabled_item_tax_rates || 0;

    if (enabledTaxRates > 0) {
      taxes.push('$product.tax_rate1');
    }

    if (enabledTaxRates > 1) {
      taxes.push('$product.tax_rate2');
    }

    if (enabledTaxRates > 2) {
      taxes.push('$product.tax_rate3');
    }

    const taxVariableIndex = getColumnIndex(
      '$product.tax',
      pdfVariables,
      updatedVariables
    );

    updatedVariables.splice(taxVariableIndex, 0, ...taxes);

    pdfVariables.splice(taxVariableIndex, 0, ...taxes);

    updatedVariables = updatedVariables.filter(
      (variable) => variable !== '$product.tax'
    );

    pdfVariables = pdfVariables.filter(
      (variable) => variable !== '$product.tax'
    );

    if (!company.enable_product_discount) {
      updatedVariables = updatedVariables.filter(
        (variable) => variable !== '$product.discount'
      );

      pdfVariables = pdfVariables.filter(
        (variable) => variable !== '$product.discount'
      );
    }

    if (
      company.enable_product_discount &&
      !updatedVariables.includes('$product.discount')
    ) {
      updatedVariables.push('$product.discount');
      pdfVariables.push('$product.discount');
    }

    ['product1', 'product2', 'product3', 'product4'].forEach((field) => {
      if (
        company?.custom_fields[field] &&
        !pdfVariables.includes(`$product.${field}`)
      ) {
        updatedVariables.splice(
          updatedVariables.length,
          0,
          `$product.${field}`
        );
      }

      if (
        !company?.custom_fields[field] &&
        pdfVariables.includes(`$product.${field}`)
      ) {
        updatedVariables = updatedVariables.filter(
          (variable) => variable !== `$product.${field}`
        );

        pdfVariables = pdfVariables.filter(
          (variable) => variable !== `$product.${field}`
        );
      }
    });

    updatedVariables = updatedVariables.filter(
      (variable) => variable !== '$product.line_total'
    );

    updatedVariables.push('$product.line_total');

    setColumns(updatedVariables);
  }, [company]);

  return columns;
}

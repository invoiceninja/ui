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

const defaultLineItemColumns = [
  { key: '$product.item', default: true },
  { key: '$product.description', default: false },
  { key: '$product.unit_cost', default: true },
  { key: '$product.discount', default: true },
  { key: '$product.quantity', default: true },
];

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
    const defaultVariables = defaultLineItemColumns.map((column) => column.key);

    let updatedVariables: string[] =
      clone(company?.settings.pdf_variables.product_columns) || [];

    let pdfVariables =
      clone(company?.settings.pdf_variables.product_columns) || [];

    defaultVariables.forEach((variable) => {
      const column = defaultLineItemColumns.find(
        (column) => column.key === variable
      );

      const columnIndex = defaultLineItemColumns.findIndex(
        (column) => column.key === variable
      );

      if (!updatedVariables.includes(variable) && column?.default) {
        updatedVariables.splice(columnIndex, 0, column.key);
      }
    });

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

    if (!company.enable_product_discount) {
      updatedVariables = updatedVariables.filter(
        (variable) => variable !== '$product.discount'
      );
    } else {
      if (!updatedVariables.includes('$product.discount')) {
        const discountColumnIndex = defaultLineItemColumns.findIndex(
          (column) => column.key === '$product.discount'
        );

        updatedVariables.splice(discountColumnIndex, 0, '$product.discount');
      }
    }

    ['product1', 'product2', 'product3', 'product4'].forEach((field) => {
      updatedVariables = updatedVariables.filter(
        (variable) => variable !== `$product.${field}`
      );

      pdfVariables = pdfVariables.filter(
        (variable) => variable !== `$product.${field}`
      );

      if (company?.custom_fields[field]) {
        const customFieldColumnIndex = getColumnIndex(
          `$product.${field}`,
          pdfVariables,
          updatedVariables
        );

        updatedVariables.splice(customFieldColumnIndex, 0, `$product.${field}`);
      }
    });

    updatedVariables = updatedVariables.filter(
      (variable) =>
        variable !== '$product.line_total' && variable !== '$product.tax'
    );

    const lineTotalColumnIndex = getColumnIndex(
      '$product.line_total',
      pdfVariables,
      updatedVariables
    );

    updatedVariables.splice(lineTotalColumnIndex, 0, '$product.line_total');

    setColumns(updatedVariables);
  }, [company]);

  return columns;
}

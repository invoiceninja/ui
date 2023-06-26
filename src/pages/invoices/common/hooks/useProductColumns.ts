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

// The function is used to find the index of a column within the given array (pdfColumns).
// If it doesn't exist within the array, then the columnIndex will be the position after the last element in the array.
export const getColumnIndex = (
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

// The function inserts the variables at the specified index into the existing variables.
export const insertVariablesAtIndex = (
  index: number,
  variablesToAdd: string[],
  existingVariables: string[]
) => {
  const preIndexVariables = existingVariables.slice(0, index);

  const postIndexVariables = existingVariables.slice(index);

  const combinedVariables = preIndexVariables.concat(
    variablesToAdd,
    postIndexVariables
  );

  return combinedVariables;
};

export function useProductColumns() {
  const company = useCurrentCompany();
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    // We need to clone the product columns to local object,
    // because by default it's frozen.
    let updatedVariables: string[] =
      clone(company?.settings.pdf_variables.product_columns) || [];

    // Separating pdf_variables from the final output due to the need to find the correct indexes in certain cases.
    let pdfVariables =
      clone(company?.settings.pdf_variables.product_columns) || [];

    const numberOfPdfVariables = pdfVariables.length;

    if (!updatedVariables.includes('$product.item')) {
      updatedVariables = ['$product.item', ...updatedVariables];
      pdfVariables = ['$product.item', ...pdfVariables];
    }

    // If initially no pdf_variables are added in the company settings, the description variable becomes the default.
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

    // Local object is needed because we want to spread tax columns in case they're enabled.
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

    // Let's remove original tax field because we don't need it anymore,
    // but first we gonna keep the index, because that's where we are injecting other input fields.
    const taxVariableIndex = getColumnIndex(
      '$product.tax',
      pdfVariables,
      updatedVariables
    );

    updatedVariables = insertVariablesAtIndex(
      taxVariableIndex,
      taxes,
      updatedVariables
    );

    pdfVariables = insertVariablesAtIndex(
      taxVariableIndex,
      taxes,
      pdfVariables
    );

    updatedVariables = updatedVariables.filter(
      (variable) => variable !== '$product.tax'
    );

    pdfVariables = pdfVariables.filter(
      (variable) => variable !== '$product.tax'
    );

    // Removing the discount variable if it is not enabled in company settings.
    if (!company.enable_product_discount) {
      updatedVariables = updatedVariables.filter(
        (variable) => variable !== '$product.discount'
      );

      pdfVariables = pdfVariables.filter(
        (variable) => variable !== '$product.discount'
      );
    }

    // Adding the discount variable, if it is not included in pdf_variables, because it should be present regardless of its inclusion in pdf_variables.
    if (
      company.enable_product_discount &&
      !updatedVariables.includes('$product.discount')
    ) {
      updatedVariables.push('$product.discount');
      pdfVariables.push('$product.discount');
    }

    // We must always add all product custom fields to the variables that are created, regardless of whether they are included in pdf_variables or not.
    // If some of them are added in pdf_variables but not added to the company, we must remove them.
    ['product1', 'product2', 'product3', 'product4'].forEach((field) => {
      if (
        company?.custom_fields[field] &&
        !pdfVariables.includes(`$product.${field}`)
      ) {
        updatedVariables = insertVariablesAtIndex(
          updatedVariables.length,
          [`$product.${field}`],
          updatedVariables
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

    // In some cases, the user may add the line_total variable in a different position than the last.
    // We want to ensure that it is completely excluded from the variables so that it can be added in the last position.
    updatedVariables = updatedVariables.filter(
      (variable) => variable !== '$product.line_total'
    );

    updatedVariables.push('$product.line_total');

    setColumns(updatedVariables);
  }, [company]);

  return columns;
}

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
import { getColumnIndex, insertVariablesAtIndex } from './useProductColumns';

export function useTaskColumns() {
  const company = useCurrentCompany();
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    // We need to clone the task columns to local object,
    // because by default it's frozen.
    let updatedVariables: string[] =
      clone(company?.settings.pdf_variables.task_columns) || [];

    // Separating pdf_variables from the final output due to the need to find the correct indexes in certain cases.
    let pdfVariables =
      clone(company?.settings.pdf_variables.task_columns) || [];

    const numberOfPdfVariables = pdfVariables.length;

    if (!updatedVariables.includes('$task.service')) {
      updatedVariables = ['$task.service', ...updatedVariables];
      pdfVariables = ['$task.service', ...pdfVariables];
    }

    // If initially no pdf_variables are added in the company settings, the description variable becomes the default.
    if (!numberOfPdfVariables) {
      updatedVariables.push('$task.description');
    }

    if (!updatedVariables.includes('$task.rate')) {
      updatedVariables.push('$task.rate');
      pdfVariables.push('$task.rate');
    }

    if (!updatedVariables.includes('$task.hours')) {
      updatedVariables.push('$task.hours');
      pdfVariables.push('$task.hours');
    }

    // Local object is needed because we want to spread tax columns in case they're enabled.
    const taxes: string[] = [];
    const enabledTaxRates = company?.enabled_item_tax_rates || 0;

    if (enabledTaxRates > 0) {
      taxes.push('$task.tax_rate1');
    }

    if (enabledTaxRates > 1) {
      taxes.push('$task.tax_rate2');
    }

    if (enabledTaxRates > 2) {
      taxes.push('$task.tax_rate3');
    }

    // Let's remove original tax field because we don't need it anymore,
    // but first we gonna keep the index, because that's where we are injecting other input fields.
    const taxVariableIndex = getColumnIndex(
      '$task.tax',
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
      (variable) => variable !== '$task.tax'
    );

    pdfVariables = pdfVariables.filter((variable) => variable !== '$task.tax');

    // Removing the discount variable if it is not enabled in company settings.
    if (!company.enable_product_discount) {
      updatedVariables = updatedVariables.filter(
        (variable) => variable !== '$task.discount'
      );

      pdfVariables = pdfVariables.filter(
        (variable) => variable !== '$task.discount'
      );
    }

    // Adding the discount variable, if it is not included in pdf_variables, because it should be present regardless of its inclusion in pdf_variables.
    if (
      company.enable_product_discount &&
      !updatedVariables.includes('$task.discount')
    ) {
      updatedVariables.push('$task.discount');
      pdfVariables.push('$task.discount');
    }

    // We must always add all task custom fields to the variables that are created, regardless of whether they are included in pdf_variables or not.
    // If some of them are added in pdf_variables but not added to the company, we must remove them.
    ['task1', 'task2', 'task3', 'task4'].forEach((field) => {
      if (
        company?.custom_fields[field] &&
        !pdfVariables.includes(`$task.${field}`)
      ) {
        updatedVariables = insertVariablesAtIndex(
          updatedVariables.length,
          [`$task.${field}`],
          updatedVariables
        );
      }

      if (
        !company?.custom_fields[field] &&
        pdfVariables.includes(`$task.${field}`)
      ) {
        updatedVariables = updatedVariables.filter(
          (variable) => variable !== `$task.${field}`
        );

        pdfVariables = pdfVariables.filter(
          (variable) => variable !== `$task.${field}`
        );
      }
    });

    // In some cases, the user may add the line_total variable in a different position than the last.
    // We want to ensure that it is completely excluded from the variables so that it can be added in the last position.
    updatedVariables = updatedVariables.filter(
      (variable) => variable !== '$task.line_total'
    );

    updatedVariables.push('$task.line_total');

    setColumns(updatedVariables);
  }, [company]);

  return columns;
}

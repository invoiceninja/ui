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

export function useTaskColumns() {
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
      clone(company?.settings.pdf_variables.task_columns) || [];

    let pdfVariables =
      clone(company?.settings.pdf_variables.task_columns) || [];

    const numberOfPdfVariables = pdfVariables.length;

    if (!updatedVariables.includes('$task.service')) {
      updatedVariables.splice(0, 0, '$task.service');
      pdfVariables.splice(0, 0, '$task.service');
    }

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

    const taxVariableIndex = getColumnIndex(
      '$task.tax',
      pdfVariables,
      updatedVariables
    );

    updatedVariables.splice(taxVariableIndex, 0, ...taxes);

    pdfVariables.splice(taxVariableIndex, 0, ...taxes);

    updatedVariables = updatedVariables.filter(
      (variable) => variable !== '$task.tax'
    );

    pdfVariables = pdfVariables.filter((variable) => variable !== '$task.tax');

    if (!company.enable_product_discount) {
      updatedVariables = updatedVariables.filter(
        (variable) => variable !== '$task.discount'
      );

      pdfVariables = pdfVariables.filter(
        (variable) => variable !== '$task.discount'
      );
    }

    if (
      company.enable_product_discount &&
      !updatedVariables.includes('$task.discount')
    ) {
      updatedVariables.push('$task.discount');
      pdfVariables.push('$task.discount');
    }

    ['task1', 'task2', 'task3', 'task4'].forEach((field) => {
      if (
        company?.custom_fields[field] &&
        !pdfVariables.includes(`$task.${field}`)
      ) {
        updatedVariables.splice(updatedVariables.length, 0, `$task.${field}`);
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

    updatedVariables = updatedVariables.filter(
      (variable) => variable !== '$task.line_total'
    );

    updatedVariables.push('$task.line_total');

    setColumns(updatedVariables);
  }, [company]);

  return columns;
}

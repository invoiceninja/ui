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
  { key: '$task.item', default: true },
  { key: '$task.description', default: false },
  { key: '$task.unit_cost', default: true },
  { key: '$task.discount', default: true },
  { key: '$task.quantity', default: true },
];

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
    const defaultVariables = defaultLineItemColumns.map((column) => column.key);

    let updatedVariables: string[] =
      clone(company?.settings.pdf_variables.task_columns) || [];

    let pdfVariables =
      clone(company?.settings.pdf_variables.task_columns) || [];

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

    if (!company.enable_product_discount) {
      updatedVariables = updatedVariables.filter(
        (variable) => variable !== '$task.discount'
      );
    } else {
      if (!updatedVariables.includes('$task.discount')) {
        const discountColumnIndex = defaultLineItemColumns.findIndex(
          (column) => column.key === '$task.discount'
        );

        updatedVariables.splice(discountColumnIndex, 0, '$task.discount');
      }
    }

    ['task1', 'task2', 'task3', 'task4'].forEach((field) => {
      updatedVariables = updatedVariables.filter(
        (variable) => variable !== `$task.${field}`
      );

      pdfVariables = pdfVariables.filter(
        (variable) => variable !== `$task.${field}`
      );

      if (company?.custom_fields[field]) {
        const customFieldColumnIndex = getColumnIndex(
          `$task.${field}`,
          pdfVariables,
          updatedVariables
        );

        updatedVariables.splice(customFieldColumnIndex, 0, `$task.${field}`);
      }
    });

    updatedVariables = updatedVariables.filter(
      (variable) => variable !== '$task.line_total' && variable !== '$task.tax'
    );

    const lineTotalColumnIndex = getColumnIndex(
      '$task.line_total',
      pdfVariables,
      updatedVariables
    );

    updatedVariables.splice(lineTotalColumnIndex, 0, '$task.line_total');

    setColumns(updatedVariables);
  }, [company]);

  return columns;
}

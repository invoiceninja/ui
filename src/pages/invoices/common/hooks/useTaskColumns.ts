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
  { key: '$task.line_total', default: true },
];

export function useTaskColumns() {
  const company = useCurrentCompany();
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    const defaultVariables = defaultLineItemColumns.map((column) => column.key);

    let updatedVariables: string[] = defaultLineItemColumns.map(
      (column) => column.key
    );

    let pdfVariables =
      clone(company?.settings.pdf_variables.task_columns) || [];

    defaultVariables.forEach((variable) => {
      const column = defaultLineItemColumns.find(
        (column) => column.key === variable
      );

      if (!pdfVariables.includes(variable) && !column?.default) {
        updatedVariables = updatedVariables.filter(
          (currentVariable) => currentVariable !== variable
        );
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

    updatedVariables = updatedVariables.filter(
      (variable) => variable !== '$task.tax'
    );

    pdfVariables = pdfVariables.filter((variable) => variable !== '$task.tax');

    updatedVariables.splice(updatedVariables.length - 1, 0, ...taxes);

    if (!company.enable_product_discount) {
      updatedVariables = updatedVariables.filter(
        (variable) => variable !== '$task.discount'
      );
    }

    ['task1', 'task2', 'task3', 'task4'].forEach((field) => {
      pdfVariables = pdfVariables.filter(
        (variable) => variable !== `$task.${field}`
      );

      if (company?.custom_fields[field]) {
        updatedVariables.splice(
          updatedVariables.length - 1,
          0,
          `$task.${field}`
        );
      }
    });

    pdfVariables.forEach((pdfVariable) => {
      const doesExistInDefaultVariables =
        defaultVariables.includes(pdfVariable);

      if (!doesExistInDefaultVariables) {
        updatedVariables.splice(updatedVariables.length - 1, 0, pdfVariable);
      }
    });

    setColumns(updatedVariables);
  }, [company]);

  return columns;
}

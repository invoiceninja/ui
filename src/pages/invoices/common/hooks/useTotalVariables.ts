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
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';

export function useTotalVariables() {
  const company = useCurrentCompany();
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (company?.settings.pdf_variables.total_columns.length > 0) {
      const columns = cloneDeep(company?.settings.pdf_variables.total_columns);

      if (company?.enabled_tax_rates > 0) {
        columns.push('$tax1');
      }
      if (company?.enabled_tax_rates > 1) {
        columns.push('$tax2');
      }
      if (company?.enabled_tax_rates > 2) {
        columns.push('$tax3');
      }

      // Replace $line_taxes and $total_taxes with $taxes at their positions
      columns.forEach((column, index) => {
        if (column === '$line_taxes' || column === '$total_taxes') {
          columns[index] = '$taxes';
        }
      });

      // Remove duplicates of $taxes that might have been created
      const uniqueColumns = columns.filter((column, index, arr) =>
        column !== '$taxes' || arr.indexOf(column) === index
      );

      setColumns(uniqueColumns);
      return;
    }

    // We need to clone the product columns to local object,
    // because by default it's frozen.
    let variables: string[] = ['$subtotal'];
    variables.push('$total');

    // clone(company?.settings.pdf_variables.total_columns) || [];

    // In case we have `$line_taxes` or `$total_taxes` we want to remove them
    // if setting isn't enabled.

    // const enabledTaxRates = company?.enabled_tax_rates || 0;

    // if (enabledTaxRates <= 0) {
    //   variables = variables.filter((variable) => variable !== '$total_taxes');
    //   variables = variables.filter((variable) => variable !== '$line_taxes');
    // }

    if (!company?.custom_fields?.surcharge1) {
      variables = variables.filter(
        (variable) => variable !== '$custom_surcharge1'
      );
    }

    if (!company?.custom_fields?.surcharge2) {
      variables = variables.filter(
        (variable) => variable !== '$custom_surcharge2'
      );
    }

    if (!company?.custom_fields?.surcharge3) {
      variables = variables.filter(
        (variable) => variable !== '$custom_surcharge3'
      );
    }

    if (!company?.custom_fields?.surcharge4) {
      variables = variables.filter(
        (variable) => variable !== '$custom_surcharge4'
      );
    }

    variables.push('$discount');
    variables.push('$paid_to_date');
    variables.push('$balance_due');
    variables.push('$taxes');

    if (company?.enabled_tax_rates > 0) {
      variables.push('$tax1');
    }
    if (company?.enabled_tax_rates > 1) {
      variables.push('$tax2');
    }
    if (company?.enabled_tax_rates > 2) {
      variables.push('$tax3');
    }

    setColumns(variables);
  }, [company]);

  return columns;
}

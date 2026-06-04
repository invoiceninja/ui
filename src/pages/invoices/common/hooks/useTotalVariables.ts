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
      let columns = cloneDeep(company?.settings.pdf_variables.total_columns);

      columns = columns.filter(
        (variable) => !variable.includes('$custom_surcharge')
      );

      if (company?.enabled_tax_rates > 0) {
        columns.push('$tax1');
      }
      if (company?.enabled_tax_rates > 1) {
        columns.push('$tax2');
      }
      if (company?.enabled_tax_rates > 2) {
        columns.push('$tax3');
      }

      if (company?.custom_fields?.surcharge1) {
        columns.push('$custom_surcharge1');
      }

      if (company?.custom_fields?.surcharge2) {
        columns.push('$custom_surcharge2');
      }

      if (company?.custom_fields?.surcharge3) {
        columns.push('$custom_surcharge3');
      }

      if (company?.custom_fields?.surcharge4) {
        columns.push('$custom_surcharge4');
      }

      setColumns(columns);
      return;
    }

    // We need to clone the product columns to local object,
    // because by default it's frozen.
    const variables: string[] = ['$subtotal'];

    variables.push('$discount');
    variables.push('$net_subtotal');

    if (company?.custom_fields?.surcharge1) {
      variables.push('$custom_surcharge1');
    }

    if (company?.custom_fields?.surcharge2) {
      variables.push('$custom_surcharge2');
    }

    if (company?.custom_fields?.surcharge3) {
      variables.push('$custom_surcharge3');
    }

    if (company?.custom_fields?.surcharge4) {
      variables.push('$custom_surcharge4');
    }

    variables.push('$total_taxes');
    variables.push('$line_taxes');
    variables.push('$total');
    variables.push('$paid_to_date');
    variables.push('$balance_due');

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

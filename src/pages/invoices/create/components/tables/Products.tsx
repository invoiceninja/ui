/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Table, Tbody, Th, Thead } from '@invoiceninja/tables';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Products() {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    setColumns(company?.settings.pdf_variables.product_columns || []);
  }, [company]);

  const resolveTranslation = (key: string) => {
    if (key.startsWith('$product')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [product, string] = key.split('.');

      return t(string);
    }

    return t(key);
  };

  return (
    <div>
      <Table>
        <Thead>
          {columns.map((column, index) => (
            <Th key={index}>{resolveTranslation(column)}</Th>
          ))}
        </Thead>
        <Tbody></Tbody>
      </Table>
    </div>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputField } from '@invoiceninja/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '@invoiceninja/tables';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { RootState } from 'common/stores/store';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export function Products() {
  const [t] = useTranslation();
  const company = useCurrentCompany();

  const [columns, setColumns] = useState([]);
  const [lineItems, setLineItems] = useState<Partial<InvoiceItem>[]>([]);
  const invoice = useSelector((state: RootState) => state.invoices.current);

  useEffect(() => {
    setColumns(company?.settings.pdf_variables.product_columns || []);
  }, [company]);

  useEffect(() => {
    if (typeof invoice?.line_items === 'string') {
      // We are dealing with empty invoice from /create endpoint.
      // An "empty" line item push is needed.

      lineItems.push({
        product_key: '',
        quantity: 0,
      });

      setLineItems(lineItems);
    }
  }, [invoice]);

  const resolveKey = (key: string) => {
    const [resource, property] = key.split('.');

    return { resource, property };
  };

  const resolveType = (key: string) => {
    const { property } = resolveKey(key);

    return <InputField id={property} />
  };

  const resolveTranslation = (key: string) => {
    const { property } = resolveKey(key);

    return property ? t(property) : t(key);
  };

  return (
    <div>
      {invoice && (
        <Table>
          <Thead>
            {columns.map((column, index) => (
              <Th key={index}>{resolveTranslation(column)}</Th>
            ))}
          </Thead>
          <Tbody>
            {lineItems.map((lineItem, index) => (
              <Tr key={index}>
                {columns.map((column, index) => (
                  <Td key={index}>{resolveType(column)}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}

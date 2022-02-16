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
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export function Products() {
  const [t] = useTranslation();
  const company = useCurrentCompany();

  const [columns, setColumns] = useState([]);
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  const invoice = useSelector((state: RootState) => state.invoices.current);

  useEffect(() => {
    setColumns(company?.settings.pdf_variables.product_columns || []);
  }, [company]);

  useEffect(() => {
    // We are dealing with empty invoice from /create endpoint.
    // An "empty" line item push is needed.

    lineItems.push({
      quantity: 0,
      cost: 0,
      product_key: '',
      product_cost: 0,
      notes: '',
      discount: 0,
      is_amount_discount: false,
      tax_name1: '',
      tax_rate1: 0,
      tax_name2: '',
      tax_rate2: 0,
      tax_name3: '',
      tax_rate3: 0,
      sort_id: 0,
      line_total: 0,
      gross_line_total: 0,
      date: '',
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
      type_id: '1',
    });

    setLineItems(lineItems);
  }, [invoice]);

  const resolveKey = (key: string) => {
    const [resource, property] = key.split('.');

    return { resource, property };
  };

  const onChange = (property: string, value: unknown, index: number) => {
    console.log(property, value, index);
  };

  const resolveInputField = (key: string, index: number) => {
    const { property } = resolveKey(key);

    if (['product_key', 'item'].includes(property)) {
      return (
        <>
          <InputField
            id={key}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(key, event.target.value, index)
            }
          />
        </>
      );
    }

    if (['discount', 'cost', 'unit_cost', 'quantity'].includes(property)) {
      return <InputField id={property} type="number" />;
    }

    if (['line_total'].includes(property)) {
      return <span>Text</span>;
    }

    return <InputField id={property} />;
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
            {lineItems.map((lineItem, lineItemIndex) => (
              <Tr key={lineItemIndex}>
                {columns.map((column, columnIndex) => (
                  <Td key={columnIndex}>
                    {resolveInputField(column, lineItemIndex)}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}

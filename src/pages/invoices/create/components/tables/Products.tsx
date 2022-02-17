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
import { current } from '@reduxjs/toolkit';
import { deepStrictEqual } from 'assert';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { RootState } from 'common/stores/store';
import { clone, isEqual, set } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export function Products() {
  const [t] = useTranslation();
  const company = useCurrentCompany();

  const blankLineItem: InvoiceItem = {
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
  };

  const [columns, setColumns] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  const invoice = useSelector((state: RootState) => state.invoices.current);

  useEffect(() => {
    console.log(company);

    // We need to clone the product columns to local object,
    // because by default it's frozen.
    const variables: string[] =
      clone(company?.settings.pdf_variables.product_columns) || [];

    // Local object is needed because we want to spread tax columns in case they're enabled.
    if (variables.includes('$product.tax')) {
      const taxes: string[] = [];
      const enabledTaxRates = company?.enabled_tax_rates || 0;

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
      const taxVariableIndex = variables.findIndex(
        (variable) => variable === '$product.tax'
      );

      variables.splice(taxVariableIndex + 1, 0, ...taxes);

      setColumns(variables.filter((variable) => variable !== '$product.tax'));
    }

    // setColumns(local as Array<InvoiceItem>);
  }, [company]);

  useEffect(() => {
    // We are dealing with empty invoice from /create endpoint.
    // An "empty" line item push is needed.

    // Check if the object contains any and if not push the blank one.

    if (lineItems.length === 0) {
      lineItems.push(blankLineItem);

      setLineItems(lineItems);
    }
  }, [invoice]);

  const resolveKey = (key: string) => {
    const [resource, property] = key.split('.');

    return { resource, property };
  };

  const onChange = (property: string, value: unknown, index: number) => {
    // Deep compare current object with empty.
    // If not the same push the new empty into the array of line items.
    // Check the last line item object in the array, if it's "empty" (equal to blank)
    // And if it's remove pop it from the array.

    // Some properties don't bind 1:1. Example of this
    // is '$product.item' while in the line item is 'product_key'.
    // To solve this we can define aliases array.

    const aliases: Record<string, string> = {
      item: 'product_key',
    };

    const { property: key } = resolveKey(property);
    const field = aliases[key] || key;

    const lineItem = lineItems[index];

    set(lineItem, field, value);

    if (isEqual(lineItem, blankLineItem)) {
      const nextLineItem = lineItems[index + 1];

      // We want to remove next line item
      // if the current one we are editing is empty.

      if (isEqual(nextLineItem, blankLineItem)) {
        const copy = clone(lineItems);
        copy.pop();

        setLineItems(copy);
      }
    } else {
      // We want to push new blank entry, if the last one isn't blank.

      const lastLineItem = lineItems[lineItems.length - 1];

      if (!isEqual(lastLineItem, blankLineItem)) {
        setLineItems((current) => [...current, blankLineItem]);
      }
    }
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
    const aliases: Record<string, string> = {
      '$product.tax_rate1': company?.settings.tax_name1 || t('tax_rate1'),
      '$product.tax_rate2': company?.settings.tax_name2 || t('tax_rate2'),
      '$product.tax_rate3': company?.settings.tax_name3 || t('tax_rate3'),
    };

    if (Object.prototype.hasOwnProperty.call(aliases, key)) {
      return aliases[key];
    }

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

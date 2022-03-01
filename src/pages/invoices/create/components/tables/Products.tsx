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
import { InvoiceItem } from 'common/interfaces/invoice-item';
import {
  deleteInvoiceLineItem,
  injectBlankItemIntoCurrent,
  setCurrentLineItemProperty,
} from 'common/stores/slices/invoices';
import { RootState } from 'common/stores/store';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { ChangeEvent } from 'react';
import { Plus, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { resolveProperty } from '../../helpers/resolve-property';
import { useFormatMoney } from '../../hooks/useFormatMoney';
import { useProductColumns } from '../../hooks/useProductColumns';
import { useResolveTranslation } from '../../hooks/useResolveTranslation';

export function Products() {
  const [t] = useTranslation();
  const invoice = useSelector((state: RootState) => state.invoices.current);
  const columns = useProductColumns();
  const resolveTranslation = useResolveTranslation();
  const dispatch = useDispatch();
  const formatMoney = useFormatMoney();

  const onChange = (key: keyof InvoiceItem, value: unknown, index: number) => {
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: key,
        value,
      })
    );
  };

  const handleProductChange = (index: number, value: Record) => {
    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'product_key',
        value: value.label,
      })
    );

    if (!value.internal && value.resource) {
      dispatch(
        setCurrentLineItemProperty({
          position: index,
          property: 'cost',
          value: value.resource?.cost || 0,
        })
      );
    }

    dispatch(
      setCurrentLineItemProperty({
        position: index,
        property: 'notes',
        value: value.resource?.notes || '',
      })
    );
  };

  const resolveInputField = (key: string, index: number) => {
    const property = resolveProperty(key);

    const numberInputs = [
      'discount',
      'cost',
      'unit_cost',
      'quantity',
      'tax_rate1',
      'tax_rate2',
      'tax_rate3',
    ];

    if (property === 'product_key') {
      return (
        <DebouncedCombobox
          endpoint="/api/v1/products"
          label="product_key"
          onChange={(value) => handleProductChange(index, value)}
          className="w-36"
        />
      );
    }

    if (numberInputs.includes(property)) {
      return (
        <InputField
          id={property}
          type="number"
          value={invoice?.line_items[index][property]}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(property, parseFloat(event.target.value), index)
          }
          className="w-24"
        />
      );
    }

    if (['line_total'].includes(property)) {
      return formatMoney(invoice?.line_items[index][property] as number);
    }

    return (
      <InputField
        id={property}
        value={invoice?.line_items[index][property]}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(property, event.target.value, index)
        }
      />
    );
  };

  return (
    <div>
      <Table>
        <Thead>
          {columns.map((column, index) => (
            <Th key={index}>{resolveTranslation(column)}</Th>
          ))}
          <Th>{/* This is placeholder for "Remove" button. */}</Th>
        </Thead>
        <Tbody>
          {invoice?.client_id &&
            invoice.line_items.map((lineItem, lineItemIndex) => (
              <Tr key={lineItemIndex}>
                {columns.map((column, columnIndex) => (
                  <Td key={columnIndex}>
                    {resolveInputField(column, lineItemIndex)}
                  </Td>
                ))}

                <Td>
                  {invoice && (
                    <button
                      className="text-gray-600 hover:text-red-600"
                      onClick={() =>
                        dispatch(deleteInvoiceLineItem(lineItemIndex))
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </Td>
              </Tr>
            ))}

          {invoice?.client_id && (
            <Tr>
              <Td colSpan={100}>
                <button
                  onClick={() => dispatch(injectBlankItemIntoCurrent())}
                  className="w-full py-2 inline-flex justify-center items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>{t('add_item')}</span>
                </button>
              </Td>
            </Tr>
          )}

          {!invoice?.client_id && (
            <Tr>
              <Td colSpan={100}>{t('no_client_selected')}.</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}

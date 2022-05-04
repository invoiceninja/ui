/* eslint-disable react/display-name */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { resolveProperty } from 'pages/invoices/common/helpers/resolve-property';
import { useHandleProductChange } from './useHandleProductChange';
import { InputField } from '@invoiceninja/forms';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { ChangeEvent, useEffect, useState } from 'react';
import { useHandleLineItemPropertyChange } from './useHandleLineItemPropertyChange';
import { useFormatMoney } from './useFormatMoney';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { DecimalNumberInput } from 'components/forms/DecimalNumberInput';
import { useGetCurrencySeparators } from 'common/hooks/useGetCurrencySeparators';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';
import { TaxRateSelector } from 'components/tax-rates/TaxRateSelector';
import { useDispatch } from 'react-redux';
import { setCurrentLineItemProperty } from 'common/stores/slices/invoices/extra-reducers/set-current-line-item-property';
import { ProductSelector } from 'components/products/ProductSelector';

const numberInputs = ['discount', 'cost', 'unit_cost', 'quantity'];
const taxInputs = ['tax_rate1', 'tax_rate2', 'tax_rate3'];

export function useResolveInputField() {
  const dispatch = useDispatch();

  const [inputCurrencySeparators, setInputCurrencySeparators] =
    useState<DecimalInputSeparators>();

  const [currentLineItemIndex, setCurrentLineItemIndex] = useState(0);
  const [currentTaxRate, setCurrentTaxRate] = useState('tax_rate1');

  const handleProductChange = useHandleProductChange();
  const onChange = useHandleLineItemPropertyChange();

  const invoice = useCurrentInvoice();
  const formatMoney = useFormatMoney();
  const getCurrency = useGetCurrencySeparators(setInputCurrencySeparators);

  useEffect(() => {
    if (invoice?.client_id) getCurrency(invoice?.client_id);
  }, [invoice?.client_id]);

  return (key: string, index: number) => {
    const property = resolveProperty(key);

    if (property === 'product_key') {
      return (
        <ProductSelector
          onChange={(value) => handleProductChange(index, value)}
          className="w-auto"
          onInputFocus={() => setCurrentLineItemIndex(index)}
          defaultValue={invoice?.line_items[index][property]}
          onProductCreated={(product) => {
            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'product_key',
                value: product.product_key,
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'quantity',
                value: product?.quantity || 1,
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'cost',
                value: product?.cost || 0,
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'notes',
                value: product?.notes || '',
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'tax_name1',
                value: product?.tax_name1 || '',
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'tax_name2',
                value: product?.tax_name2 || '',
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'tax_name3',
                value: product?.tax_name3 || '',
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'tax_rate1',
                value: product?.tax_rate1 || 0,
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'tax_rate2',
                value: product?.tax_rate2 || 0,
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'tax_rate3',
                value: product?.tax_rate3 || 0,
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'custom_value1',
                value: product?.custom_value1 || '',
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'custom_value2',
                value: product?.custom_value2 || '',
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'custom_value3',
                value: product?.custom_value3 || '',
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: 'custom_value4',
                value: product?.custom_value4 || '',
              })
            );
          }}
        />
      );
    }

    if (property === 'notes') {
      return (
        <InputField
          id={property}
          element="textarea"
          value={invoice?.line_items[index][property]}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(property, event.target.value, index)
          }
        />
      );
    }

    if (numberInputs.includes(property)) {
      return (
        inputCurrencySeparators && (
          <DecimalNumberInput
            precision={
              property === 'quantity' ? 6 : inputCurrencySeparators.precision
            }
            id={property}
            currency={inputCurrencySeparators}
            initialValue={invoice?.line_items[index][property] as string}
            className="auto"
            onChange={(value: string) => {
              onChange(property, parseFloat(value), index);
            }}
          />
        )
      );
    }

    if (taxInputs.includes(property)) {
      return (
        <TaxRateSelector
          onChange={(value) => {
            value.resource && onChange(property, value.resource.rate, index);
            value.resource &&
              onChange(
                property.replace('rate', 'name') as keyof InvoiceItem,
                value.resource.name,
                index
              );
          }}
          className="w-auto"
          defaultValue={invoice?.line_items[index][property]}
          onInputFocus={() => {
            setCurrentLineItemIndex(index);
            setCurrentTaxRate(property);
          }}
          onClearButtonClick={() => {
            onChange(property, '', index);

            onChange(
              property.replace('rate', 'name') as keyof InvoiceItem,
              '',
              index
            );
          }}
          clearButton={Boolean(invoice?.line_items[index][property])}
          onTaxCreated={(taxRate) => {
            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: currentTaxRate,
                value: taxRate.rate,
              })
            );

            dispatch(
              setCurrentLineItemProperty({
                position: currentLineItemIndex,
                property: currentTaxRate.replace('rate', 'name'),
                value: taxRate.name,
              })
            );
          }}
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
}

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
import { ChangeEvent, useEffect, useState } from 'react';
import { useFormatMoney } from './useFormatMoney';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { DecimalNumberInput } from 'components/forms/DecimalNumberInput';
import { useGetCurrencySeparators } from 'common/hooks/useGetCurrencySeparators';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';
import { TaxRateSelector } from 'components/tax-rates/TaxRateSelector';
import { useDispatch } from 'react-redux';
import { setCurrentLineItemProperty } from 'common/stores/slices/invoices/extra-reducers/set-current-line-item-property';
import { ProductSelector } from 'components/products/ProductSelector';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { CustomField } from 'components/CustomField';
import { Invoice } from 'common/interfaces/invoice';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';

const numberInputs = [
  'discount',
  'cost',
  'unit_cost',
  'quantity',
  'rate',
  'hours',
];

const taxInputs = ['tax_rate1', 'tax_rate2', 'tax_rate3'];

interface Props {
  resource: Invoice | RecurringInvoice;
  onProductChange: (index: number, lineItem: InvoiceItem) => unknown;
  onLineItemPropertyChange: (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => unknown;
}

export function useResolveInputField(props: Props) {
  const dispatch = useDispatch();

  const [inputCurrencySeparators, setInputCurrencySeparators] =
    useState<DecimalInputSeparators>();

  const [currentLineItemIndex, setCurrentLineItemIndex] = useState(0);
  const [currentTaxRate, setCurrentTaxRate] = useState('tax_rate1');

  const handleProductChange = useHandleProductChange({
    resource: props.resource,
    onChange: props.onProductChange,
  });

  const onChange = (key: keyof InvoiceItem, value: unknown, index: number) =>
    props.onLineItemPropertyChange(key, value, index);

  const company = useCurrentCompany();
  const resource = props.resource;
  const formatMoney = useFormatMoney({ resource: props.resource });
  const getCurrency = useGetCurrencySeparators(setInputCurrencySeparators);

  useEffect(() => {
    if (resource?.client_id) {
      getCurrency(resource?.client_id);
    }
  }, [resource?.client_id]);

  return (key: string, _id: string) => {
    const property = resolveProperty(key);
    const index = resource.line_items.findIndex((item) => item._id === _id);

    if (property === 'product_key') {
      return (
        <ProductSelector
          onChange={(value) =>
            handleProductChange(index, value.label, value.resource)
          }
          className="w-auto"
          onInputFocus={() => setCurrentLineItemIndex(index)}
          defaultValue={resource?.line_items[index][property]}
          onProductCreated={(product) =>
            handleProductChange(index, product.product_key, product)
          }
        />
      );
    }

    if (property === 'notes') {
      return (
        <InputField
          id={property}
          element="textarea"
          value={resource?.line_items[index][property]}
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
            initialValue={resource?.line_items[index][property] as string}
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
          defaultValue={resource?.line_items[index][property]}
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
          clearButton={Boolean(resource?.line_items[index][property])}
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
      return formatMoney(resource?.line_items[index][property] as number);
    }

    if (['product1', 'product2', 'product3', 'product4'].includes(property)) {
      const field = property.replace(
        'product',
        'custom_value'
      ) as keyof InvoiceItem;

      return company.custom_fields?.[property] ? (
        <CustomField
          field={property}
          defaultValue={resource?.line_items[index][field]}
          value={company.custom_fields?.[property]}
          onChange={(value) => onChange(field, value, index)}
          fieldOnly
        />
      ) : (
        <InputField
          id={property}
          value={resource?.line_items[index][property]}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(property, event.target.value, index)
          }
        />
      );
    }

    return (
      <InputField
        id={property}
        value={resource?.line_items[index][property]}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(property, event.target.value, index)
        }
      />
    );
  };
}

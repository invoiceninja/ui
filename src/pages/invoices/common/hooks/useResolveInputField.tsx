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

import { resolveProperty } from '$app/pages/invoices/common/helpers/resolve-property';
import { useHandleProductChange } from './useHandleProductChange';
import { InputField } from '$app/components/forms';
import { ChangeEvent, useEffect, useState } from 'react';
import { useFormatMoney } from './useFormatMoney';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { DecimalNumberInput } from '$app/components/forms/DecimalNumberInput';
import { useGetCurrencySeparators } from '$app/common/hooks/useGetCurrencySeparators';
import { DecimalInputSeparators } from '$app/common/interfaces/decimal-number-input-separators';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import { ProductSelector } from '$app/components/products/ProductSelector';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { CustomField } from '$app/components/CustomField';
import {
  ProductTableResource,
  RelationType,
} from '../components/ProductsTable';
import { useHandleTaxRateChange } from './useHandleTaxRateChange';
import { Product } from '$app/common/interfaces/product';

const numberInputs = [
  'discount',
  'cost',
  'unit_cost',
  'quantity',
  'rate',
  'hours',
  'tax_amount',
];

const taxInputs = ['tax_rate1', 'tax_rate2', 'tax_rate3'];

interface Props {
  resource: ProductTableResource;
  type: 'product' | 'task';
  relationType: RelationType;
  onLineItemChange: (
    index: number,
    lineItem: InvoiceItem
  ) => InvoiceItem[] | Promise<InvoiceItem[]>;
  onLineItemPropertyChange: (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => InvoiceItem[] | Promise<InvoiceItem[]>;
  createItem: () => unknown;
  deleteLineItem: (index: number) => unknown;
}

export const isLineItemEmpty = (lineItem: InvoiceItem) => {
  if (
    !lineItem.cost &&
    !lineItem.quantity &&
    !lineItem.notes &&
    !lineItem.product_key
  ) {
    return true;
  }

  return false;
};

export function useResolveInputField(props: Props) {
  const [inputCurrencySeparators, setInputCurrencySeparators] =
    useState<DecimalInputSeparators>();

  const isAnyExceptLastLineItemEmpty = (items: InvoiceItem[]) => {
    const filteredItems = items.filter(
      (item, index) => index !== items.length - 1
    );

    return filteredItems.some(
      (lineItem) =>
        !lineItem.cost &&
        !lineItem.quantity &&
        !lineItem.notes &&
        !lineItem.product_key
    );
  };

  const cleanLineItemsList = (lineItems: InvoiceItem[]) => {
    let typeId = InvoiceItemType.Product;

    if (props.type === 'task') {
      typeId = InvoiceItemType.Task;
    }

    const typeFilteredLineItems = lineItems.filter(
      ({ type_id }) => type_id === typeId
    );

    const lineItemsLength = typeFilteredLineItems.length;

    const lastLineItem = typeFilteredLineItems[lineItemsLength - 1];

    if (lineItemsLength > 0) {
      if (
        !isAnyExceptLastLineItemEmpty(typeFilteredLineItems) &&
        !isLineItemEmpty(lastLineItem)
      ) {
        props.createItem();
      }

      if (
        isAnyExceptLastLineItemEmpty(typeFilteredLineItems) &&
        isLineItemEmpty(lastLineItem)
      ) {
        const lastLineItemIndex = lineItems.indexOf(
          typeFilteredLineItems[lineItemsLength - 1]
        );

        if (lastLineItemIndex > -1) {
          props.deleteLineItem(lastLineItemIndex);
        }
      }
    }
  };

  const handleProductChange = useHandleProductChange({
    resource: props.resource,
    type: props.type,
    onChange: props.onLineItemChange,
  });

  const handleTaxRateChange = useHandleTaxRateChange({
    resource: props.resource,
    type: props.type,
    onChange: props.onLineItemChange,
  });

  const onChange = async (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const updatedLineItemsList = await props.onLineItemPropertyChange(
      key,
      value,
      index
    );

    cleanLineItemsList(updatedLineItemsList);
  };

  const onProductChange = async (
    index: number,
    value: string,
    product: Product
  ) => {
    const updatedLineItems = await handleProductChange(index, value, product);

    cleanLineItemsList(updatedLineItems);
  };

  const company = useCurrentCompany();
  const resource = props.resource;

  const formatMoney = useFormatMoney({
    resource: props.resource,
    relationType: props.relationType,
  });

  const getCurrency = useGetCurrencySeparators(setInputCurrencySeparators);

  useEffect(() => {
    resource[props.relationType] &&
      getCurrency(resource[props.relationType], props.relationType);
  }, [resource?.[props.relationType]]);

  return (key: string, index: number) => {
    const property = resolveProperty(key);

    if (property === 'product_key') {
      return (
        <ProductSelector
          key={resource?.line_items[index][property]}
          onChange={(value) =>
            value.resource &&
            onProductChange(index, value.label, value.resource)
          }
          className="w-auto"
          defaultValue={resource?.line_items[index][property]}
          onProductCreated={(product) =>
            product && onProductChange(index, product.product_key, product)
          }
          clearButton
          onClearButtonClick={() => handleProductChange(index, '')}
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
          onChange={(value) =>
            value.resource &&
            handleTaxRateChange(property, index, value.resource)
          }
          onTaxCreated={(taxRate) =>
            handleTaxRateChange(property, index, taxRate)
          }
          className="w-auto"
          defaultValue={resource?.line_items[index][property]}
          onClearButtonClick={() => {
            onChange(property, '', index);

            onChange(
              property.replace('rate', 'name') as keyof InvoiceItem,
              '',
              index
            );
          }}
          clearButton={Boolean(resource?.line_items[index][property])}
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
          onValueChange={(value) => onChange(field, value, index)}
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

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
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useFormatMoney } from './useFormatMoney';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { useGetCurrencySeparators } from '$app/common/hooks/useGetCurrencySeparators';
import { DecimalInputSeparators } from '$app/common/interfaces/decimal-number-input-separators';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import { ProductSelector } from '$app/components/products/ProductSelector';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { CustomField } from '$app/components/CustomField';
import {
  ProductTableResource,
  RelationType,
  isDeleteActionTriggeredAtom,
} from '../components/ProductsTable';
import { useHandleTaxRateChange } from './useHandleTaxRateChange';
import { Product } from '$app/common/interfaces/product';
import { useAtom } from 'jotai';

import collect from 'collect.js';
import {
  TaxCategorySelector,
  useTaxCategories,
} from '$app/components/tax-rates/TaxCategorySelector';
import { Inline } from '$app/components/Inline';
import { FiRepeat } from 'react-icons/fi';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useLocation } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import {
  getTaxRateComboValue,
  TaxNamePropertyType,
} from '$app/common/helpers/tax-rates/tax-rates-combo';
import { Icon } from '$app/components/icons/Icon';
import { MdWarning } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import useDoesTaxRateExistByComboValue from '$app/common/hooks/tax-rates/useDoesTaxRateExistByComboValue';
import { useColorScheme } from '$app/common/colors';

const numberInputs = [
  'discount',
  'cost',
  'unit_cost',
  'quantity',
  'rate',
  'hours',
];

const taxInputs = ['tax_rate1', 'tax_rate2', 'tax_rate3'];

const defaultCurrencySeparators: DecimalInputSeparators = {
  decimalSeparator: '.',
  precision: 2,
  thousandSeparator: ',',
};

interface Props {
  resource: ProductTableResource;
  type: 'product' | 'task';
  relationType: RelationType;
  onLineItemChange: (index: number, lineItem: InvoiceItem) => unknown;
  onLineItemPropertyChange: (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => unknown;
  createItem: () => unknown;
  deleteLineItem: (index: number) => unknown;
}

export const isLineItemEmpty = (lineItem: InvoiceItem) => {
  const properties = Object.keys(lineItem);

  return !properties.some((property) => {
    return (
      property !== '_id' &&
      property !== 'type_id' &&
      property !== 'is_amount_discount' &&
      lineItem[property as keyof InvoiceItem]
    );
  });
};

export function useResolveInputField(props: Props) {
  const [t] = useTranslation();

  const location = useLocation();
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const reactSettings = useReactSettings();

  const { resource } = props;

  const doesTaxRateExistByComboValue = useDoesTaxRateExistByComboValue();

  const [inputCurrencySeparators, setInputCurrencySeparators] =
    useState<DecimalInputSeparators>();

  const [isDeleteActionTriggered, setIsDeleteActionTriggered] = useAtom(
    isDeleteActionTriggeredAtom
  );

  const isAnyExceptLastLineItemEmpty = (items: InvoiceItem[]) => {
    const filteredItems = items.filter(
      (item, index) => index !== items.length - 1
    );

    return filteredItems.some((lineItem) => isLineItemEmpty(lineItem));
  };

  const cleanLineItemsList = useCallback(
    (lineItems: InvoiceItem[]) => {
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
    },
    [props.resource.line_items]
  );

  const handleProductChange = useHandleProductChange({
    relationType: props.relationType,
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
    value: string | number | boolean,
    index: number
  ) => {
    if (isDeleteActionTriggered) {
      setIsDeleteActionTriggered(false);
    }

    await props.onLineItemPropertyChange(key, value, index);
  };

  const onProductChange = async (
    index: number,
    value: string,
    product: Product | null
  ) => {
    setIsDeleteActionTriggered(false);

    const updatedProduct = cloneDeep(product) as Product;

    if (product && company && company.enabled_item_tax_rates === 0) {
      updatedProduct.tax_name1 = '';
      updatedProduct.tax_rate1 = 0;
      updatedProduct.tax_name2 = '';
      updatedProduct.tax_rate2 = 0;
      updatedProduct.tax_name3 = '';
      updatedProduct.tax_rate3 = 0;
    }

    if (product && company && company.enabled_item_tax_rates === 1) {
      if (
        company.settings?.tax_name1 &&
        !product.tax_name1 &&
        !Number(company.enabled_tax_rates)
      ) {
        updatedProduct.tax_name1 = company.settings.tax_name1;
        updatedProduct.tax_rate1 = company.settings.tax_rate1;
      }

      updatedProduct.tax_name2 = '';
      updatedProduct.tax_rate2 = 0;
      updatedProduct.tax_name3 = '';
      updatedProduct.tax_rate3 = 0;
    }

    if (product && company && company.enabled_item_tax_rates === 2) {
      if (
        company.settings?.tax_name2 &&
        !product.tax_name2 &&
        !Number(company.enabled_tax_rates)
      ) {
        updatedProduct.tax_name2 = company.settings.tax_name2;
        updatedProduct.tax_rate2 = company.settings.tax_rate2;
      }

      updatedProduct.tax_name3 = '';
      updatedProduct.tax_rate3 = 0;
    }

    if (product && company && company.enabled_item_tax_rates === 3) {
      if (
        company.settings?.tax_name3 &&
        !product.tax_name3 &&
        !Number(company.enabled_tax_rates)
      ) {
        updatedProduct.tax_name3 = company.settings.tax_name3;
        updatedProduct.tax_rate3 = company.settings.tax_rate3;
      }
    }

    await handleProductChange(index, value, updatedProduct);
  };

  const formatMoney = useFormatMoney({
    resource: props.resource,
    relationType: props.relationType,
  });

  const getCurrency = useGetCurrencySeparators(
    setInputCurrencySeparators,
    resource
  );

  useEffect(() => {
    if (resource[props.relationType]) {
      getCurrency(resource[props.relationType], props.relationType);
    } else {
      setInputCurrencySeparators(defaultCurrencySeparators);
    }
  }, [resource?.[props.relationType]]);

  useEffect(() => {
    // if (isDeleteActionTriggered === false) {
    //   cleanLineItemsList(resource?.line_items);
    // } // Disabled, causing infinite loop of line items
  }, [resource?.line_items, isDeleteActionTriggered]);

  const taxCategories = useTaxCategories();
  const { preferences } = usePreferences();

  const showTaxRateSelector = (
    property: 'tax_rate1' | 'tax_rate2' | 'tax_rate3',
    index: number,
    lineItem: InvoiceItem
  ) => {
    if (company.calculate_taxes) {
      if (lineItem.tax_id === '7' || lineItem.tax_id === '') {
        return (
          <Inline>
            <TaxRateSelector
              key={`${property}${lineItem[property]}`}
              onChange={(value) =>
                value.resource &&
                handleTaxRateChange(property, index, value.resource)
              }
              onTaxCreated={(taxRate) =>
                handleTaxRateChange(property, index, taxRate)
              }
              defaultValue={getTaxRateComboValue(
                lineItem,
                property.replace('rate', 'name') as TaxNamePropertyType
              )}
              onClearButtonClick={() => handleTaxRateChange(property, index)}
            />

            {property === 'tax_rate1' ? (
              <button
                type="button"
                onClick={() => onChange('tax_id', '1', index)}
              >
                <FiRepeat />
              </button>
            ) : null}
          </Inline>
        );
      }

      const categories = collect(taxCategories)
        .pluck('value')
        .filter((i) => i !== '7')
        .toArray();

      if (categories.includes(lineItem.tax_id) && property === 'tax_rate1') {
        return (
          <Inline>
            <TaxCategorySelector
              value={lineItem.tax_id}
              onChange={(taxCategory) =>
                onChange('tax_id', taxCategory.value, index)
              }
            />
          </Inline>
        );
      }

      return null;
    }

    const taxComboValue = getTaxRateComboValue(
      lineItem,
      property.replace('rate', 'name') as TaxNamePropertyType
    );

    return (
      <div className="flex flex-col items-center gap-y-2">
        <TaxRateSelector
          key={`${property}${lineItem[property]}`}
          onChange={(value) =>
            value.resource &&
            handleTaxRateChange(property, index, value.resource)
          }
          onTaxCreated={(taxRate) =>
            handleTaxRateChange(property, index, taxRate)
          }
          defaultValue={getTaxRateComboValue(
            lineItem,
            property.replace('rate', 'name') as TaxNamePropertyType
          )}
          onClearButtonClick={() => handleTaxRateChange(property, index)}
        />

        {taxComboValue &&
          !doesTaxRateExistByComboValue(
            taxComboValue.split('||')[0],
            parseFloat(taxComboValue.split('||')[1])
          ) && (
            <div className="flex items-center gap-x-2 self-start max-w-full">
              <div>
                <Icon element={MdWarning} size={20} color="orange" />
              </div>

              <div className="flex gap-x-1 items-center text-sm font-medium text-wrap flex-wrap">
                <span style={{ color: colors.$3 }}>
                  {taxComboValue.split('||')[0]} {taxComboValue.split('||')[1]}%
                </span>

                <span
                  className="underline cursor-pointer"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    handleTaxRateChange(property, index);
                  }}
                >
                  {t('remove')}
                </span>
              </div>
            </div>
          )}
      </div>
    );
  };

  return (key: string, index: number, lineItem: InvoiceItem) => {
    const property = resolveProperty(key);

    const resourceItem = resource?.line_items[index];

    if (property === 'product_key') {
      return (
        <ProductSelector
          key={`${property}${lineItem[property]}`}
          onChange={(value) => {
            if (value.value !== lineItem[property]) {
              onProductChange(index, value.label, value.resource);
            }
          }}
          className="w-auto"
          defaultValue={lineItem[property]}
          onProductCreated={(product) =>
            product && onProductChange(index, product.product_key, product)
          }
          clearButton
          onClearButtonClick={() => handleProductChange(index, '', null)}
          displayStockQuantity={location.pathname.startsWith('/invoices')}
        />
      );
    }

    if (property === 'notes') {
      return (
        <InputField
          id={property}
          key={`${property}${index}`}
          element="textarea"
          value={lineItem[property]}
          onValueChange={(value) => {
            if (lineItem[property] !== value) {
              onChange(property, value, index);
            }
          }}
          style={{ marginTop: '4px' }}
          textareaRows={preferences.auto_expand_product_table_notes ? 1 : 3}
        />
      );
    }

    if (numberInputs.includes(property)) {
      return (
        inputCurrencySeparators && (
          <NumberInputField
            precision={
              property === 'quantity'
                ? 6
                : reactSettings?.number_precision &&
                  reactSettings?.number_precision > 0 &&
                  reactSettings?.number_precision <= 100
                ? reactSettings.number_precision
                : inputCurrencySeparators?.precision || 2
            }
            id={property}
            value={lineItem[property] || ''}
            className="auto"
            onValueChange={(value: string) => {
              const parsed = isNaN(parseFloat(value)) ? 0 : parseFloat(value);

              if (lineItem[property] !== parsed) {
                onChange(property, parsed, index);
              }
            }}
          />
        )
      );
    }

    if ('gross_line_total' === property) {
      return formatMoney(((resourceItem ?? lineItem)[property] ?? 0) as number);
    }

    if ('tax_amount' === property) {
      return formatMoney(((resourceItem ?? lineItem)[property] ?? 0) as number);
    }

    if (taxInputs.includes(property)) {
      return showTaxRateSelector(property as 'tax_rate1', index, lineItem);
    }

    if (['line_total'].includes(property)) {
      return formatMoney(((resourceItem ?? lineItem)[property] ?? 0) as number);
    }

    if (['product1', 'product2', 'product3', 'product4'].includes(property)) {
      const field = property.replace(
        'product',
        'custom_value'
      ) as keyof InvoiceItem;

      return company.custom_fields?.[property] ? (
        <CustomField
          field={property}
          defaultValue={lineItem[field]}
          value={company.custom_fields?.[property]}
          onValueChange={(value) => {
            if (lineItem[field] !== value) {
              onChange(field, value, index);
            }
          }}
          fieldOnly
          selectMenuPosition="fixed"
        />
      ) : (
        <InputField
          id={property}
          value={lineItem[property]}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (lineItem[property] !== event.target.value) {
              onChange(property, event.target.value, index);
            }
          }}
        />
      );
    }

    if (['task1', 'task2', 'task3', 'task4'].includes(property)) {
      const field = property.replace(
        'task',
        'custom_value'
      ) as keyof InvoiceItem;

      return company.custom_fields?.[property] ? (
        <CustomField
          field={property}
          defaultValue={lineItem[field]}
          value={company.custom_fields?.[property]}
          onValueChange={(value) => {
            if (lineItem[field] !== value) {
              onChange(field, value, index);
            }
          }}
          fieldOnly
          selectMenuPosition="fixed"
        />
      ) : (
        <InputField
          id={property}
          value={lineItem[property]}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (lineItem[property] !== event.target.value) {
              onChange(property, event.target.value, index);
            }
          }}
        />
      );
    }

    return (
      <InputField
        id={property}
        value={lineItem[property]}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (lineItem[property] !== event.target.value) {
            onChange(property, event.target.value, index);
          }
        }}
      />
    );
  };
}

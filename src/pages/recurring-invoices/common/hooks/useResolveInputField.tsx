/* eslint-disable react/display-name */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { resolveProperty } from 'pages/invoices/common/helpers/resolve-property';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { useTranslation } from 'react-i18next';
import { InputField } from '@invoiceninja/forms';
import { ChangeEvent, useEffect, useState } from 'react';
import { useHandleLineItemPropertyChange } from './useHandleLineItemPropertyChange';
import { useCurrentRecurringInvoice } from 'common/hooks/useCurrentRecurringInvoice';
import { useFormatMoney } from './useFormatMoney';
import { useHandleProductChange } from './useHandleProductChange';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { DecimalNumberInput } from 'components/forms/DecimalNumberInput';
import { useGetCurrencySeparators } from 'common/hooks/useGetCurrencySeparators';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';

const numberInputs = ['discount', 'cost', 'unit_cost', 'quantity'];
const taxInputs = ['tax_rate1', 'tax_rate2', 'tax_rate3'];

interface Props {
  setIsTaxModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentLineItemIndex: React.Dispatch<React.SetStateAction<number>>;
  setCurrentTaxRate: React.Dispatch<React.SetStateAction<string>>;
}

export function useResolveInputField(props: Props) {
  const handleProductChange = useHandleProductChange();
  const [inputCurrencySeparators, setInputCurrencySeparators] =
    useState<DecimalInputSeparators>();

  const onChange = useHandleLineItemPropertyChange();
  const [t] = useTranslation();
  const {
    setIsTaxModalOpen,
    setIsProductModalOpen,
    setCurrentLineItemIndex,
    setCurrentTaxRate,
  } = props;

  const invoice = useCurrentRecurringInvoice();
  const formatMoney = useFormatMoney();
  const getCurrency = useGetCurrencySeparators(setInputCurrencySeparators);

  useEffect(() => {
    if (invoice?.client_id) getCurrency(invoice?.client_id);
  }, [invoice?.client_id]);

  return (key: string, index: number) => {
    const property = resolveProperty(key);

    if (property === 'product_key') {
      return (
        <DebouncedCombobox
          endpoint="/api/v1/products"
          label="product_key"
          onChange={(value) => handleProductChange(index, value)}
          className="w-auto"
          onActionClick={() => {
            setIsProductModalOpen(true);
            setCurrentLineItemIndex(index);
          }}
          actionLabel={t('new_product')}
          defaultValue={invoice?.line_items[index][property]}
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
            id={property}
            precision={
              property === 'quantity' ? 6 : inputCurrencySeparators.precision
            }
            currency={inputCurrencySeparators}
            initialValue={invoice?.line_items[index][property] as string}
            className="w-auto"
            onChange={(value: string) => {
              onChange(property, parseFloat(value), index);
            }}
          />
        )
      );
    }

    if (taxInputs.includes(property)) {
      return (
        <DebouncedCombobox
          endpoint="/api/v1/tax_rates"
          label={property}
          value="rate"
          onChange={(value) => {
            value.resource &&
              onChange(property, parseFloat(value.resource.rate), index);
            value.resource &&
              onChange(
                property.replace('rate', 'name') as keyof InvoiceItem,
                value.resource.name,
                index
              );
          }}
          className="w-auto"
          formatLabel={(resource) => `${resource.name} ${resource.rate}%`}
          onActionClick={() => setIsTaxModalOpen(true)}
          actionLabel={t('create_tax_rate')}
          defaultValue={invoice?.line_items[index][property]}
          onInputFocus={() => {
            setCurrentLineItemIndex(index);
            setCurrentTaxRate(property);
          }}
          onClearButtonClick={() =>{
            onChange(property, '', index);

            onChange(
              property.replace('rate','name') as keyof InvoiceItem,
              '',
              index);
          }}
          clearButton={Boolean(invoice?.line_items[index][property])}
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

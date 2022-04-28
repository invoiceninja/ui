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
import { useHandleProductChange } from './useHandleProductChange';
import { useTranslation } from 'react-i18next';
import { InputField } from '@invoiceninja/forms';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { ChangeEvent, useEffect, useState } from 'react';
import { useHandleLineItemPropertyChange } from './useHandleLineItemPropertyChange';
import { useFormatMoney } from './useFormatMoney';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { isNonNumericValue } from 'common/helpers/invoices/resolve-non-numeric-value';
import { CurrencyInput } from 'components/forms/CurrencyInput';
import { ClientResolver } from 'common/helpers/clients/client-resolver';
import { CurrencyResolver } from 'common/helpers/currencies/currency-resolver';
import { Client } from 'common/interfaces/client';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Currency } from 'common/interfaces/currency';

const numberInputs = ['discount', 'unit_cost', 'quantity'];
const taxInputs = ['tax_rate1', 'tax_rate2', 'tax_rate3'];

interface Props {
  setIsTaxModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useResolveInputField(props: Props) {
  const [t] = useTranslation();
  const { setIsTaxModalOpen, setIsProductModalOpen } = props;
  const [currency, setCurrency] = useState<Currency>();
  const handleProductChange = useHandleProductChange();
  const onChange = useHandleLineItemPropertyChange();

  const invoice = useCurrentInvoice();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const clientResolver = new ClientResolver();
  const currencyresolver = new CurrencyResolver();

  const getCurrency = async (client_id: string) => {
    if (invoice?.client_id) {
      const client: Client = await clientResolver.find(client_id);
      const currency: Currency | undefined = await currencyresolver.find(
        client.settings.currency_id
      );
      currency && setCurrency(currency);
    } else {
      const currency: Currency | undefined = await currencyresolver.find(
        company.settings?.currency_id
      );
      currency && setCurrency(currency);
    }
  };
  useEffect(() => {
    if (invoice?.client_id) getCurrency(invoice?.client_id);
  }, [invoice?.client_id]);

  return (key: string, index: number) => {
    const property = resolveProperty(key);

    if (property === 'product_key') {
      return (
        <>
          <DebouncedCombobox
            endpoint="/api/v1/products"
            label="product_key"
            onChange={(value) => handleProductChange(index, value)}
            className="w-36"
            onActionClick={() => setIsProductModalOpen(true)}
            actionLabel={t('new_product')}
            defaultValue={invoice?.line_items[index][property]}
          />
        </>
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
    if (property === 'cost') {
      console.log('resolve curr', currency);

      return (
        currency && (
          <CurrencyInput
            id={property}
            currency={currency}
            initialValue={invoice?.line_items[index][property]}
            className="w-24"
            onChange={(event: string) => {
              onChange(property, parseFloat(event), index);
            }}
          />
        )
      );
    }

    if (numberInputs.includes(property)) {
      return (
        <InputField
          id={property}
          value={invoice?.line_items[index][property]}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            isNonNumericValue(event)
              ? event
              : onChange(property, parseFloat(event.target.value), index)
          }
          className="w-24"
        />
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
          className="w-36"
          formatLabel={(resource) => `${resource.name}(${resource.rate}%)`}
          onActionClick={() => setIsTaxModalOpen(true)}
          actionLabel={t('create_tax_rate')}
          defaultValue={invoice?.line_items[index][property]}
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

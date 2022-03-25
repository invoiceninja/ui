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
import { ChangeEvent } from 'react';
import { useHandleLineItemPropertyChange } from './useHandleLineItemPropertyChange';
import { useFormatMoney } from './useFormatMoney';

const numberInputs = [
  'discount',
  'cost',
  'unit_cost',
  'quantity',
  'tax_rate1',
  'tax_rate2',
  'tax_rate3',
];
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: any;
}
export function useResolveInputField(props: Props) {
  const handleProductChange = useHandleProductChange();
  const onChange = useHandleLineItemPropertyChange();
  const [t] = useTranslation();
  const invoice = useCurrentInvoice();
  const formatMoney = useFormatMoney();
  const { isModalOpen, setIsModalOpen } = props;
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
            onActionClick={() => setIsModalOpen(!isModalOpen)}
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
}

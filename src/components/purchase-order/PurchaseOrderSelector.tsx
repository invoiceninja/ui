/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { ComboboxAsync, Entry } from '../forms/Combobox';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';

interface Props extends GenericSelectorProps<PurchaseOrder> {
  clearButton?: boolean;
  onClearButtonClick?: () => void;
}
export function PurchaseOrderSelector(props: Props) {
  const formatMoney = useFormatMoney();

  const formatLabel = (purchaseOrder: PurchaseOrder) => {
    return `#${purchaseOrder.number} (${formatMoney(
      purchaseOrder.amount,
      purchaseOrder?.vendor?.country_id,
      purchaseOrder?.vendor?.currency_id
    )})`;
  };

  return (
    <ComboboxAsync<PurchaseOrder>
      inputOptions={{
        value: props.value ?? null,
      }}
      endpoint={endpoint(
        '/api/v1/purchase_orders?include=vendor&status=active'
      )}
      onChange={(purchaseOrder: Entry<PurchaseOrder>) =>
        purchaseOrder.resource && props.onChange(purchaseOrder.resource)
      }
      entryOptions={{
        id: 'id',
        value: 'id',
        label: 'number',
        dropdownLabelFn: (purchaseOrder) => formatLabel(purchaseOrder),
        inputLabelFn: (purchaseOrder) =>
          purchaseOrder ? formatLabel(purchaseOrder) : '',
      }}
      onDismiss={props.onClearButtonClick}
      errorMessage={props.errorMessage}
    />
  );
}

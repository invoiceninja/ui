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
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';

interface Props extends GenericSelectorProps<RecurringInvoice> {
  clearButton?: boolean;
  onClearButtonClick?: () => void;
}
export function RecurringInvoiceSelector(props: Props) {
  const formatMoney = useFormatMoney();

  const formatLabel = (recurringInvoice: RecurringInvoice) => {
    return `#${recurringInvoice.number} (${formatMoney(
      recurringInvoice.amount,
      recurringInvoice?.client?.country_id,
      recurringInvoice?.client?.settings.currency_id
    )})`;
  };

  return (
    <ComboboxAsync<RecurringInvoice>
      inputOptions={{
        value: props.value ?? null,
      }}
      endpoint={endpoint(
        '/api/v1/recurring_invoices?include=client&status=active'
      )}
      onChange={(recurringInvoice: Entry<RecurringInvoice>) =>
        recurringInvoice.resource && props.onChange(recurringInvoice.resource)
      }
      entryOptions={{
        id: 'id',
        value: 'id',
        label: 'number',
        dropdownLabelFn: (recurringInvoice) => formatLabel(recurringInvoice),
        inputLabelFn: (recurringInvoice) =>
          recurringInvoice ? formatLabel(recurringInvoice) : '',
      }}
      onDismiss={props.onClearButtonClick}
      errorMessage={props.errorMessage}
    />
  );
}

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
import { Invoice } from '$app/common/interfaces/invoice';
import { ComboboxAsync, Entry } from '../forms/Combobox';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';

interface Props extends GenericSelectorProps<Invoice> {
  clearButton?: boolean;
  onClearButtonClick?: () => void;
}
export function InvoiceSelector(props: Props) {
  const formatMoney = useFormatMoney();

  const formatLabel = (invoice: Invoice) => {
    return `#${invoice.number} (${formatMoney(
      invoice.amount,
      invoice?.client?.country_id,
      invoice?.client?.settings.currency_id
    )})`;
  };

  return (
    <ComboboxAsync<Invoice>
      inputOptions={{
        value: props.value ?? null,
      }}
      endpoint={endpoint(
        '/api/v1/invoices?include=client&filter_deleted_clients=true&status=active'
      )}
      onChange={(invoice: Entry<Invoice>) =>
        invoice.resource && props.onChange(invoice.resource)
      }
      entryOptions={{
        id: 'id',
        value: 'id',
        label: 'number',
        dropdownLabelFn: (invoice) => formatLabel(invoice),
        inputLabelFn: (invoice) => (invoice ? formatLabel(invoice) : ''),
      }}
      onDismiss={props.onClearButtonClick}
      errorMessage={props.errorMessage}
    />
  );
}

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
import { Quote } from '$app/common/interfaces/quote';

interface Props extends GenericSelectorProps<Quote> {
  clearButton?: boolean;
  onClearButtonClick?: () => void;
}
export function QuoteSelector(props: Props) {
  const formatMoney = useFormatMoney();

  const formatLabel = (quote: Quote) => {
    return `#${quote.number} (${formatMoney(
      quote.amount,
      quote?.client?.country_id,
      quote?.client?.settings.currency_id
    )})`;
  };

  return (
    <ComboboxAsync<Quote>
      inputOptions={{
        value: props.value ?? null,
      }}
      endpoint={endpoint(
        '/api/v1/quotes?include=client&filter_deleted_clients=true&status=active'
      )}
      onChange={(quote: Entry<Quote>) =>
        quote.resource && props.onChange(quote.resource)
      }
      entryOptions={{
        id: 'id',
        value: 'id',
        label: 'number',
        dropdownLabelFn: (quote) => formatLabel(quote),
        inputLabelFn: (quote) => (quote ? formatLabel(quote) : ''),
      }}
      onDismiss={props.onClearButtonClick}
      errorMessage={props.errorMessage}
    />
  );
}

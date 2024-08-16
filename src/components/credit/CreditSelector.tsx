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
import { Credit } from '$app/common/interfaces/credit';

interface Props extends GenericSelectorProps<Credit> {
  clearButton?: boolean;
  onClearButtonClick?: () => void;
}
export function CreditSelector(props: Props) {
  const formatMoney = useFormatMoney();

  const formatLabel = (credit: Credit) => {
    return `#${credit.number} (${formatMoney(
      credit.amount,
      credit?.client?.country_id,
      credit?.client?.settings.currency_id
    )})`;
  };

  return (
    <ComboboxAsync<Credit>
      inputOptions={{
        value: props.value ?? null,
      }}
      endpoint={endpoint(
        '/api/v1/credits?include=client&filter_deleted_clients=true&status=active'
      )}
      onChange={(credit: Entry<Credit>) =>
        credit.resource && props.onChange(credit.resource)
      }
      entryOptions={{
        id: 'id',
        value: 'id',
        label: 'number',
        dropdownLabelFn: (credit) => formatLabel(credit),
        inputLabelFn: (credit) => (credit ? formatLabel(credit) : ''),
      }}
      onDismiss={props.onClearButtonClick}
      errorMessage={props.errorMessage}
    />
  );
}

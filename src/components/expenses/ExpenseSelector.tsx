/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ComboboxAsync, Entry } from '../forms/Combobox';
import { Alert } from '../Alert';
import { date, endpoint } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Expense } from '$app/common/interfaces/expense';

interface Props {
  defaultValue?: string | number | boolean;
  clearButton?: boolean;
  className?: string;
  onValueChange?: (value: Entry<Expense>) => unknown;
  onClearButtonClick?: () => unknown;
  errorMessage?: string | string[];
  label?: string | undefined;
  clearInputAfterSelection?: boolean;
  clientId?: string;
  exclude?: string[];
  clientStatus?: string;
}

export function ExpenseSelector(props: Props) {
  const { dateFormat } = useCurrentCompanyDateFormats();

  const currentClientId = props.clientId ? `&client_id=${props.clientId}` : '';
  const currentClientStatus = props.clientStatus
    ? `&client_status=${props.clientStatus}`
    : '';

  return (
    <>
      <ComboboxAsync<Expense>
        endpoint={endpoint(
          `/api/v1/expenses?per_page=800${currentClientStatus}${currentClientId}`
        )}
        inputOptions={{ value: props.defaultValue ?? null, label: props.label }}
        entryOptions={{
          id: 'id',
          label: 'number',
          value: 'id',
          dropdownLabelFn: (resource) => (
            <div className="flex space-x-1">
              <span># {resource.number}</span>
              {resource.date && <span>-</span>}
              {resource.date && <span>{date(resource.date, dateFormat)}</span>}
            </div>
          ),
        }}
        onChange={(expense) =>
          props.onValueChange && props.onValueChange(expense)
        }
        onDismiss={props.onClearButtonClick}
        sortBy="created_at|desc"
        nullable
        clearInputAfterSelection={props.clearInputAfterSelection}
        exclude={props.exclude}
      />

      {props.errorMessage && (
        <Alert type="danger" className="mt-2">
          {props.errorMessage}
        </Alert>
      )}
    </>
  );
}

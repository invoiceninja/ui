/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Task } from '$app/common/interfaces/task';
import { ErrorMessage } from '../ErrorMessage';
import { ComboboxAsync, Entry } from '../forms/Combobox';

interface Props {
  defaultValue?: string | number | boolean;
  clearButton?: boolean;
  className?: string;
  onValueChange?: (value: Entry<Task>) => unknown;
  onClearButtonClick?: () => unknown;
  errorMessage?: string | string[];
  label?: string | undefined;
  clearInputAfterSelection?: boolean;
  clientId?: string;
  exclude?: string[];
  clientStatus?: string;
  withShadow?: boolean;
}

export function TaskSelector(props: Props) {
  const { dateFormat } = useCurrentCompanyDateFormats();

  const currentClientId = props.clientId ? `&client_id=${props.clientId}` : '';
  const currentClientStatus = props.clientStatus
    ? `&client_status=${props.clientStatus}`
    : '';

  return (
    <>
      <ComboboxAsync<Task>
        endpoint={endpoint(
          `/api/v1/tasks?per_page=800${currentClientStatus}${currentClientId}`
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
        onChange={(task) => props.onValueChange && props.onValueChange(task)}
        onDismiss={props.onClearButtonClick}
        sortBy="created_at|desc"
        nullable
        clearInputAfterSelection={props.clearInputAfterSelection}
        exclude={props.exclude}
        withShadow={props.withShadow}
      />

      <ErrorMessage className="mt-2">{props.errorMessage}</ErrorMessage>
    </>
  );
}

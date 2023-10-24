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
import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { ComboboxAsync, Entry } from '../forms/Combobox';

export function TaskStatusSelector(props: GenericSelectorProps<TaskStatus>) {
  return (
    <ComboboxAsync<TaskStatus>
      endpoint={endpoint('/api/v1/task_statuses?status=active')}
      onChange={(taskStatus: Entry<TaskStatus>) =>
        taskStatus.resource && props.onChange(taskStatus.resource)
      }
      inputOptions={{
        label: props.inputLabel?.toString(),
        value: props.value || null,
      }}
      entryOptions={{
        id: 'id',
        label: 'name',
        value: 'id',
      }}
      onDismiss={props.onClearButtonClick}
      readonly={props.readonly}
      errorMessage={props.errorMessage}
    />
  );
}

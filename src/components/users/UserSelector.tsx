/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { User } from '$app/common/interfaces/user';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ComboboxAsync } from '../forms/Combobox';
import { endpoint } from '$app/common/helpers';

interface UserSelectorProps extends GenericSelectorProps<User> {
  endpoint?: string;
  staleTime?: number;
}

export function UserSelector(props: UserSelectorProps) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (
    <ComboboxAsync<User>
      inputOptions={{
        label: props.inputLabel?.toString(),
        value: props.value ?? null,
      }}
      endpoint={
        endpoint(props.endpoint || '/api/v1/users?status=active')
      }
      entryOptions={{
        id: 'id',
        value: 'id',
        label: 'first_name',
        inputLabelFn: (resource) =>
          resource ? `${resource.first_name} ${resource.last_name}` : '',
        dropdownLabelFn: (resource) =>
          `${resource.first_name} ${resource.last_name}`,
      }}
      readonly={props.readonly}
      onDismiss={props.onClearButtonClick}
      action={{
        label: t('new_user'),
        onClick: () => navigate('/settings/users'),
        visible: true,
      }}
      onChange={(entry) =>
        entry.resource ? props.onChange(entry.resource) : null
      }
      staleTime={props.staleTime || Infinity}
    />
  );
}

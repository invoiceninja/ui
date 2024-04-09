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
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxAsync, Entry } from '../forms/Combobox';
import { endpoint } from '$app/common/helpers';
import { GroupSettings } from '$app/common/interfaces/group-settings';

export interface GroupSettingsSelectorProps
  extends GenericSelectorProps<GroupSettings> {
  initiallyVisible?: boolean;
  setVisible?: Dispatch<SetStateAction<boolean>>;
  staleTime?: number;
}

export function GroupSettingsSelector(props: GroupSettingsSelectorProps) {
  const [t] = useTranslation();

  return (
    <ComboboxAsync<GroupSettings>
      endpoint={endpoint('/api/v1/group_settings?status=active')}
      onChange={(group: Entry<GroupSettings>) =>
        group.resource && props.onChange(group.resource)
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
      action={{
        label: t('new_group'),
        onClick: () => {},
        visible: false,
      }}
      readonly={props.readonly}
      onDismiss={props.onClearButtonClick}
      initiallyVisible={props.initiallyVisible}
      sortBy="name|asc"
      staleTime={props.staleTime}
      errorMessage={props.errorMessage}
    />
  );
}

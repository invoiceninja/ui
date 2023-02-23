/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GenericSelectorProps } from 'common/interfaces/generic-selector-props';
import { User } from 'common/interfaces/user';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function UserSelector(props: GenericSelectorProps<User>) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (
    <DebouncedCombobox
      inputLabel={props.inputLabel}
      endpoint="/api/v1/users"
      label="name"
      onChange={(value: Record<User>) =>
        value.resource && props.onChange(value.resource)
      }
      formatLabel={(resource) => `${resource.first_name} ${resource.last_name}`}
      defaultValue={props.value}
      disabled={props.readonly}
      clearButton={props.clearButton}
      onClearButtonClick={props.onClearButtonClick}
      queryAdditional
      actionLabel={t('new_user')}
      onActionClick={() => navigate('/settings/users')}
      errorMessage={props.errorMessage}
    />
  );
}

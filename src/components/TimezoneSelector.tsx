/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Timezone } from '$app/common/interfaces/statics';
import { useStaticsQuery } from '$app/common/queries/statics';
import { SelectField } from './forms';

interface Props {
  value: string;
  onValueChange?: (value: string) => void;
  errorMessage?: string | string[];
  disabled?: boolean;
  dismissable?: boolean;
  withBlank?: boolean;
  readOnly?: boolean;
}

export function TimezoneSelector({
  value,
  onValueChange,
  errorMessage,
  disabled,
  dismissable,
  withBlank,
  readOnly,
}: Props) {
  const { data: statics } = useStaticsQuery();

  return (
    <SelectField
      value={value}
      onValueChange={onValueChange}
      customSelector
      disabled={disabled}
      errorMessage={errorMessage}
      dismissable={dismissable}
      withBlank={withBlank}
      readOnly={readOnly}
    >
      {statics?.timezones
        .sort((a: Timezone, b: Timezone) => a.name.localeCompare(b.name))
        .map((timezone: Timezone) => (
          <option value={timezone.id} key={timezone.id}>
            {timezone.name}
          </option>
        ))}
    </SelectField>
  );
}

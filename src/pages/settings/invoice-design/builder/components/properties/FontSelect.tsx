/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectField } from '$app/components/forms/SelectField';
import { fonts } from '$app/pages/settings/invoice-design/pages/general-settings/components/GeneralSettings';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string | string[];
  id?: string;
}

/**
 * Canonical font picker. Used in DocumentSettingsPanel and GeneralSettings so
 * font selection has identical UX everywhere.
 */
export function FontSelect({
  label,
  value,
  onChange,
  disabled,
  errorMessage,
  id,
}: Props) {
  return (
    <SelectField
      id={id}
      label={label}
      value={value || 'roboto'}
      onValueChange={onChange}
      disabled={disabled}
      errorMessage={errorMessage}
      customSelector
      dismissable={false}
    >
      {fonts.map((font) => (
        <option key={font.label} value={font.value}>
          {font.label}
        </option>
      ))}
    </SelectField>
  );
}

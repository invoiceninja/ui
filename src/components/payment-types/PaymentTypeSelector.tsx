/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PaymentType } from '$app/common/interfaces/statics';
import { useStaticsQuery } from '$app/common/queries/statics';
import { GenericSelectorProps } from '$app/components/CountrySelector';
import { SelectField } from '$app/components/forms';

export function PaymentTypeSelector(props: GenericSelectorProps) {
  const statics = useStaticsQuery();

  return (
    <SelectField
      value={props.value}
      onValueChange={props.onChange}
      withBlank
      errorMessage={props.errorMessage}
      customSelector
    >
      {statics.data?.payment_types
        .sort((a: PaymentType, b: PaymentType) => a.name.localeCompare(b.name))
        .map((type: PaymentType, index: number) => (
          <option key={index} value={type.id}>
            {type.name}
          </option>
        ))}
    </SelectField>
  );
}

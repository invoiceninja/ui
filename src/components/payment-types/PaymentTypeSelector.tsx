/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from '$app/common/queries/statics';
import { GenericSelectorProps } from '$app/components/CountrySelector';
import { SearchableSelect } from '../SearchableSelect';

export function PaymentTypeSelector(props: GenericSelectorProps) {
  const statics = useStaticsQuery();

  return (
    <SearchableSelect
      value={props.value}
      onValueChange={props.onChange}
      errorMessage={props.errorMessage}
    >
      <option value=""></option>
      {statics.data?.payment_types.map((type, index) => (
        <option key={index} value={type.id}>
          {type.name}
        </option>
      ))}
    </SearchableSelect>
  );
}

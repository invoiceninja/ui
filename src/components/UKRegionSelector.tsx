/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GenericSelectorProps } from './CountrySelector';
import { ukRegions } from '$app/common/constants/uk-regions';
import { SearchableSelect } from './SearchableSelect';

export function UKRegionSelector(props: GenericSelectorProps) {
  return (
    <SearchableSelect
      value={props.value}
      label={props.label}
      disabled={props.disabled}
      onValueChange={props.onChange}
      errorMessage={props.errorMessage}
      dismissable
    >
      {Object.entries(ukRegions).map((state, index) => (
        <option key={index} value={state[0]}>
          {state[1]}
        </option>
      ))}
    </SearchableSelect>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Design } from 'common/interfaces/design';
import { GenericSelectorProps } from 'common/interfaces/generic-selector-props';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';

export function DesignSelector(props: GenericSelectorProps<Design>) {
  return (
    <DebouncedCombobox
      {...props}
      value="id"
      endpoint="/api/v1/designs"
      label="name"
      defaultValue={props.value}
      onChange={(design: Record<Design>) =>
        design.resource && props.onChange(design.resource)
      }
    />
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AvailableTypes } from '.';
import { Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';

export function Field(props: { field: string; placeholder: string }) {
  return (
    <Element
      leftSide={<InputField id={props.field} placeholder={props.placeholder} />}
    >
      <SelectField>
        <AvailableTypes />
      </SelectField>
    </Element>
  );
}

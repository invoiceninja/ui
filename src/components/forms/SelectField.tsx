/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { InputLabel } from '.';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  defaultValue?: any;
  label?: string;
  required?: boolean;
}

export function SelectField(props: Props) {
  return (
    <section>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
          {props.label}
          {props.required && <span className="ml-1 text-red-600">*</span>}
        </InputLabel>
      )}

      <select
        onChange={props.onChange}
        id={props.id}
        className={classNames(
          `w-full py-2 px-3 rounded text-sm  border border-gray-300 ${props.className}`
        )}
        defaultValue={props.defaultValue}
        value={props.value}
        ref={props.innerRef}
      >
        {props.children}
      </select>
    </section>
  );
}

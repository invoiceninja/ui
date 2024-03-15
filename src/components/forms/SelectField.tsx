/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { Alert } from '$app/components/Alert';
import { InputLabel } from '.';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';

export interface SelectProps extends CommonProps {
  defaultValue?: any;
  label?: string | null;
  required?: boolean;
  withBlank?: boolean;
  onValueChange?: (value: string) => unknown;
  errorMessage?: string | string[];
  blankOptionValue?: string | number;
}

export function SelectField(props: SelectProps) {
  const colors = useColorScheme();

  return (
    <section>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
          {props.label}
          {props.required && <span className="ml-1 text-red-600">*</span>}
        </InputLabel>
      )}

      <select
        onChange={(event) => {
          props.onValueChange && props.onValueChange(event.target.value);
          props.onChange && props.onChange(event);
        }}
        id={props.id}
        className={classNames(
          `w-full py-2 rounded text-sm border disabled:cursor-not-allowed ${props.className}`
        )}
        defaultValue={props.defaultValue}
        value={props.value}
        ref={props.innerRef}
        disabled={props.disabled}
        style={{
          backgroundColor: colors.$1,
          borderColor: colors.$5,
          color: colors.$3,
          ...props.style,
        }}
        data-cy={props.cypressRef}
      >
        {props.withBlank && (
          <option value={props.blankOptionValue ?? ''}></option>
        )}
        {props.children}
      </select>

      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </section>
  );
}

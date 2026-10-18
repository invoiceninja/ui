/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import CommonProps from '../../common/interfaces/common-props.interface';
import { InputLabel } from './InputLabel';
import { ErrorMessage } from '../ErrorMessage';

interface Props extends CommonProps {
  label?: string;
  placeholder?: string;
  rows?: number | undefined;
  errorMessage?: string | string[];
  disabled?: boolean;
}

export function Textarea(props: Props) {
  const colors = useColorScheme();

  return (
    <section>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
          {props.label}
        </InputLabel>
      )}

      <textarea
        rows={props.rows ?? 5}
        id={props.id}
        className={`form-textarea w-full py-2 px-3 rounded border border-gray-300 text-sm ${props.className}`}
        style={{
          backgroundColor: colors.$1,
          color: colors.$3,
          colorScheme: colors.$0,
        }}
        placeholder={props.placeholder}
        onChange={props.onChange}
        value={props.value}
        disabled={props.disabled}
      >
        {props.children}
      </textarea>

      <ErrorMessage className="mt-2">{props.errorMessage}</ErrorMessage>
    </section>
  );
}

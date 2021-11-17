/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Props {
  label?: string;
  id?: string;
  type?: string | "text";
  name?: string;
  className?: string;
  placeholder?: string;
  onChange?: any;
  disabled?: boolean | false;
  required?: boolean;
}

export function Input(props: Props) {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-gray-700"
      >
        {props.label}
      </label>
      <div className="mt-1">
        <input
          type={props.type}
          name={props.name}
          id={props.id}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={props.placeholder}
          onChange={props.onChange}
          disabled={props.disabled}
          required={props.required}
        />
      </div>
    </div>
  );
}

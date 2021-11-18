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
  name?: string;
  required?: boolean;
  onChange?: any;
  value?: string;
}

export function Checkbox(props: Props) {
  return (
    <div className="flex items-center">
      <input
        id={props.id}
        name={props.name}
        type="checkbox"
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        required={props.required}
        onChange={props.onChange}
        value={props.value}
      />
      <label
        htmlFor={props.id}
        className="ml-2 block text-sm text-gray-900 cursor-pointer"
      >
        {props.label}
      </label>
    </div>
  );
}

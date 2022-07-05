/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from 'common/helpers';
import toast from 'react-hot-toast';

interface Props {
  children: string;
}

export function Variable(props: Props) {
  return (
    <span
      className="px-2 py-1 bg-gray-100 rounded m-1 inline-flex items-center space-x-2 hover:cursor-pointer"
      onClick={() => {
        navigator.clipboard.writeText(props.children);

        toast.success(trans('copied_to_clipboard', { value: props.children }));
      }}
    >
      {props.children}
    </span>
  );
}

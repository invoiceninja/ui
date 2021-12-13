/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  to?: string;
}

export function DropdownElement(props: Props) {
  if (props.to) {
    return (
      <Link
        to={props.to}
        className="w-full text-left hover:bg-gray-100 z-50 block px-4 py-2 text-sm text-gray-700"
      >
        {props.children}
      </Link>
    );
  }

  return (
    <button
      onClick={props.onClick}
      ref={props.innerRef}
      className="w-full text-left hover:bg-gray-100 z-50 block px-4 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
    >
      {props.children}
    </button>
  );
}

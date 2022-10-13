/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import CommonProps from 'common/interfaces/common-props.interface';

interface Props extends CommonProps {
  className?: string;
}

export function NonClickableElement(props: Props) {
  return (
    <div
      className={`w-full text-left px-4 sm:px-6 block hover:bg-gray-50 py-4 text-gray-700 hover:text-gray-900 text-sm ${props.className}`}
    >
      {props.children}
    </div>
  );
}

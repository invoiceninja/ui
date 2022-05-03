/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  colSpan?: number;
  width?: string;
}

export function Td(props: Props) {
  return (
    <td
      width={props.width}
      colSpan={props.colSpan}
      className={`px-2 lg:px-2.5 xl:px-4 py-2 whitespace-nowrap text-sm text-gray-900 ${props.className}`}
    >
      {props.children}
    </td>
  );
}

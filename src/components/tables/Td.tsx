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

interface Props extends CommonProps {
  colSpan?: number;
  rowSpan?: number;
  width?: string;
}

export function Td(props: Props) {
  const colors = useColorScheme();

  return (
    <td
      width={props.width}
      colSpan={props.colSpan}
      rowSpan={props.rowSpan}
      onClick={props.onClick}
      className={`px-2 lg:px-2.5 xl:px-4 py-2 whitespace-nowrap text-sm  ${props.className}`}
      style={{ color: colors.$3 }}
    >
      {props.children}
    </td>
  );
}

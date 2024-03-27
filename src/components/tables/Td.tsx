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
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import {
  hexToRGB,
  isColorLight,
  useAdjustColorDarkness,
} from '$app/common/hooks/useAdjustColorDarkness';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  colSpan?: number;
  rowSpan?: number;
  width?: string;
  customizeTextColor?: boolean;
}

export function Td(props: Props) {
  const { customizeTextColor } = props;

  const adjustColorDarkness = useAdjustColorDarkness();

  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const { red, green, blue, hex } = hexToRGB(accentColor);

  const darknessAmount = isColorLight(red, green, blue) ? -220 : 220;

  return (
    <td
      width={props.width}
      colSpan={props.colSpan}
      rowSpan={props.rowSpan}
      onClick={props.onClick}
      className={`px-2 lg:px-2.5 xl:px-4 py-2 whitespace-nowrap text-sm  ${props.className}`}
      style={{
        color: customizeTextColor
          ? adjustColorDarkness(hex, darknessAmount)
          : colors.$3,
      }}
    >
      {props.children}
    </td>
  );
}

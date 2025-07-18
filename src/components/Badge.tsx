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
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import CommonProps from '../common/interfaces/common-props.interface';
import {
  hexToRGB,
  isColorLight,
  useAdjustColorDarkness,
} from '$app/common/hooks/useAdjustColorDarkness';

export type BadgeVariant =
  | 'primary'
  | 'white'
  | 'yellow'
  | 'red'
  | 'generic'
  | 'light-blue'
  | 'blue'
  | 'orange'
  | 'dark-blue'
  | 'green'
  | 'black'
  | 'purple'
  | 'transparent';

interface Props extends CommonProps {
  variant?: BadgeVariant;
}

const defaultProps: Props = {
  variant: 'generic',
};

export function Badge(props: Props) {
  props = { ...defaultProps, ...props };

  const accentColor = useAccentColor();

  const adjustColorDarkness = useAdjustColorDarkness();

  const styles: React.CSSProperties = { ...props.style };

  if (props.variant === 'primary') {
    styles.backgroundColor = styles.backgroundColor || accentColor;
    styles.color = 'white';
  }

  const getTextContrastColor = (color: string) => {
    if (color.length === 7) {
      const { red, green, blue, hex } = hexToRGB(color);

      const darknessAmount = isColorLight(red, green, blue) ? -220 : 220;

      return adjustColorDarkness(hex, darknessAmount);
    }

    return undefined;
  };

  return (
    <span
      style={{
        ...styles,
        color: styles.backgroundColor
          ? getTextContrastColor(styles.backgroundColor)
          : undefined,
      }}
      className={classNames(
        'text-xs px-2 py-1 rounded font-medium',
        {
          'bg-transparent': props.variant === 'transparent',
          'bg-[#A1A1AA] bg-opacity-15 text-[#A1A1AA]':
            props.variant === 'generic',
          'bg-white border bg-opacity-15 text-gray-500':
            props.variant === 'white',
          'bg-yellow-500 bg-opacity-15 text-yellow-500':
            props.variant === 'yellow',
          'bg-red-500 bg-opacity-15 text-red-500': props.variant === 'red',
          'bg-blue-300 bg-opacity-15 text-blue-300':
            props.variant === 'light-blue',
          'bg-blue-400 bg-opacity-15 text-blue-400': props.variant === 'blue',
          'bg-blue-700 bg-opacity-15 text-blue-700':
            props.variant === 'dark-blue',
          'bg-orange-500 bg-opacity-15 text-orange-500':
            props.variant === 'orange',
          'bg-green-500 bg-opacity-15 text-green-500':
            props.variant === 'green',
          'bg-black bg-opacity-15 text-black': props.variant === 'black',
          'bg-purple-500 bg-opacity-15 text-purple-500':
            props.variant === 'purple',
        },
        props.className
      )}
    >
      {props.children}
    </span>
  );
}

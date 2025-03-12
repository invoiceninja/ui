/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { isValidElement, cloneElement, createElement } from 'react';
import { IconType } from 'react-icons';
import { Icon as ReactFeatherIcon } from 'react-feather';
import CommonProps from '$app/common/interfaces/common-props.interface';

interface Props extends CommonProps {
  element: IconType | ReactFeatherIcon;
  size?: number;
  color?: string;
}

export function Icon(props: Props) {
  const accentColor = useAccentColor();

  const iconElement = createElement(props.element);

  if (isValidElement(iconElement)) {
    return cloneElement(iconElement, {
      fontSize: props.size || 18,
      color: props.color || accentColor,
      className: props.className,
      onClick: props.onClick,
      style: props.style,
    });
  }

  return <></>;
}

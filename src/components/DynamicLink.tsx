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
import CommonProps from '$app/common/interfaces/common-props.interface';
import React, { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface Props extends CommonProps {
  to: string;
  children: ReactNode;
  renderSpan?: boolean;
}

export function DynamicLink(props: Props) {
  const accentColor = useAccentColor();

  const { renderSpan } = props;

  if (renderSpan) {
    return <span className={props.className}>{props.children}</span>;
  }

  return (
    <RouterLink
      className={`text-sm hover:underline ${props.className}`}
      style={{ color: accentColor }}
      to={props.to}
    >
      {props.children}
    </RouterLink>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { ReactNode } from 'react';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';

interface Props extends CommonProps {
  for?: string;
  children: ReactNode;
}

export function InputLabel(props: Props) {
  const colors = useColorScheme();

  return (
    <label
      className={`text-sm font-medium block ${props.className}`}
      htmlFor={props.for}
      style={{ color: colors.$3 }}
    >
      {props.children}
    </label>
  );
}

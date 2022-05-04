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

interface Props extends CommonProps {
  for?: string;
  children: ReactNode;
}

export function InputLabel(props: Props) {
  return (
    <label
      className={`text-sm text-gray-800 block ${props.className}`}
      htmlFor={props.for}
    >
      {props.children}
    </label>
  );
}

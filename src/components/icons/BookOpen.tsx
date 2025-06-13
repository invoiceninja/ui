/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';

interface Props {
  color?: string;
  size?: string;
}

export function BookOpen({ color = '#000', size = '18px' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{
        width: size,
        height: size,
      }}
      viewBox="0 0 18 18"
    >
      <path
        d="M9,16.25c0-1.105,.895-2,2-2h4.25c.552,0,1-.448,1-1V3.75c0-.552-.448-1-1-1h-4.25c-1.105,0-2,.895-2,2"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        data-color="color-2"
      ></path>
      <path
        d="M9,16.25V4.75c0-1.105-.895-2-2-2H2.75c-.552,0-1,.448-1,1V13.25c0,.552,.448,1,1,1H7c1.105,0,2,.895,2,2Z"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      ></path>
    </svg>
  );
}

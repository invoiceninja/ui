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
  size?: string;
  color?: string;
}

export function Income({ size = '1rem', color = '#000' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
    >
      <rect
        x="15"
        y="7"
        width="2"
        height="10"
        rx=".5"
        ry=".5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        fill={color}
      ></rect>
      <rect
        x="9"
        y="11"
        width="2"
        height="6"
        rx=".5"
        ry=".5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        fill={color}
      ></rect>
      <rect
        x="3"
        y="15"
        width="2"
        height="2"
        rx=".5"
        ry=".5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        fill={color}
      ></rect>
      <polyline
        points="6 3 10 3 10 7"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></polyline>
      <line
        x1="10"
        y1="3"
        x2="3"
        y2="10"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></line>
    </svg>
  );
}

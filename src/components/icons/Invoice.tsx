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
  className?: string;
}

export function Invoice({
  size = '1rem',
  color = '#A1A1AA',
  className,
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 18 18"
      className={className}
    >
      <path
        d="M14.75,3.75v12.5l-2.75-1.5-3,1.5-3-1.5-2.75,1.5V3.75c0-1.105,.895-2,2-2h7.5c1.105,0,2,.895,2,2Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <line
        x1="5.75"
        y1="11.25"
        x2="9.25"
        y2="11.25"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></line>
      <line
        x1="11.75"
        y1="11.25"
        x2="12.25"
        y2="11.25"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></line>
      <circle
        cx="9"
        cy="6.5"
        r="1.75"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></circle>
    </svg>
  );
}

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

export function SackCoins(props: Props) {
  const { size = '1rem', color = '#000' } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 18 18"
    >
      <path
        d="M9.5,4.75l2-3c0-.552-.448-1-1-1h-2.75s-2.75,0-2.75,0c-.552,0-1,.448-1,1l2,3h3.5Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <line
        x1="7.75"
        y1="4.75"
        x2="7.75"
        y2="3.25"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></line>
      <path
        d="M12.156,7.25c-.722-1.06-1.641-1.956-2.656-2.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <path
        d="M6,4.75C3.609,6.031,1.75,9.266,1.75,12c0,3.314,2.686,4.25,6,4.25,.207,0,.412-.004,.613-.011"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <rect
        x="10.75"
        y="7.25"
        width="6.5"
        height="3"
        rx="1"
        ry="1"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></rect>
      <rect
        x="9.75"
        y="10.25"
        width="6.5"
        height="3"
        rx="1"
        ry="1"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></rect>
      <rect
        x="10.75"
        y="13.25"
        width="6.5"
        height="3"
        rx="1"
        ry="1"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></rect>
    </svg>
  );
}

export default SackCoins;

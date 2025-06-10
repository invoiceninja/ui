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

export function Sparkle({ size = '1.2rem', color = '#000' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
    >
      <polygon
        points="12 3 13.1538 6.8462 17 8 13.1538 9.1538 12 13 10.8462 9.1538 7 8 10.8462 6.8462 12 3"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        fill={color}
      ></polygon>
      <path
        d="m8.5137,13.7692l-1.6807-.6347-.6309-1.6921c-.2188-.5899-1.1855-.5899-1.4043,0l-.6309,1.6921-1.6807.6347c-.292.1106-.4863.3923-.4863.7069s.1943.5963.4863.7069l1.6807.6347.6309,1.6921c.1094.295.3896.4901.7021.4901s.5928-.1952.7021-.4901l.6309-1.6921,1.6807-.6347c.292-.1106.4863-.3923.4863-.7069s-.1943-.5963-.4863-.7069Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
    </svg>
  );
}

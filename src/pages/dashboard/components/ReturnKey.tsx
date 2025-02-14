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

export function ReturnKey({ color = '#000', size = '1.3rem' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 12 12"
    >
      <path
        d="m9.75,7.5H1.25c-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75h8.5c.1377,0,.25-.1123.25-.25v-2.5c0-.1377-.1123-.25-.25-.25h-1.75c-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75h1.75c.9648,0,1.75.7852,1.75,1.75v2.5c0,.9648-.7852,1.75-1.75,1.75Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
      <path
        d="m3.75,10.25c-.1919,0-.3838-.0732-.5303-.2197L.4697,7.2803c-.293-.293-.293-.7676,0-1.0605l2.75-2.75c.293-.293.7676-.293,1.0605,0s.293.7676,0,1.0605l-2.2197,2.2197,2.2197,2.2197c.293.293.293.7676,0,1.0605-.1465.1465-.3384.2197-.5303.2197Z"
        strokeWidth="0"
        fill={color}
      ></path>
    </svg>
  );
}

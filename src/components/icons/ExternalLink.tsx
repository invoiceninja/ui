/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Props {
  color?: string;
  size?: string;
}

export function ExternalLink({ color = '#000', size = '1.3rem' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
    >
      <polyline
        points="17 8 17 3 12 3"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></polyline>
      <line
        x1="17"
        y1="3"
        x2="10"
        y2="10"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></line>
      <path
        d="m8,3h-2c-1.657,0-3,1.343-3,3v8c0,1.657,1.343,3,3,3h8c1.657,0,3-1.343,3-3v-2"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      ></path>
    </svg>
  );
}

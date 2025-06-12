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
  size?: string;
  color?: string;
  strokeWidth?: string;
}

export function Export({
  size = '1.2rem',
  color = '#000',
  strokeWidth = '1.5',
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 12 12"
    >
      <line
        x1="6"
        y1="1"
        x2="6"
        y2="8.75"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={strokeWidth}
        data-color="color-2"
      ></line>
      <polyline
        points="8.25 3 6 .75 3.75 3"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={strokeWidth}
        data-color="color-2"
      ></polyline>
      <path
        d="m3.5,5.25h-.25c-1.105,0-2,.895-2,2v2c0,1.105.895,2,2,2h5.5c1.105,0,2-.895,2-2v-2c0-1.105-.895-2-2-2h-.25"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={strokeWidth}
      ></path>
    </svg>
  );
}

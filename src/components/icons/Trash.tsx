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
}

export function Trash({ size = '1.2rem', color = '#FFF' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 18 18"
    >
      <path
        d="m13.474,7.25l-.374,7.105c-.056,1.062-.934,1.895-1.997,1.895h-4.205c-1.064,0-1.941-.833-1.997-1.895l-.374-7.105"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <line
        x1="2.75"
        y1="4.75"
        x2="15.25"
        y2="4.75"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></line>
      <path
        d="m6.75,4.75v-2c0-.552.448-1,1-1h2.5c.552,0,1,.448,1,1v2"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></path>
    </svg>
  );
}

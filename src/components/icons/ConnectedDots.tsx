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

export function ConnectedDots({ color = '#000', size = '18px' }: Props) {
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
      <line
        x1="4.664"
        y1="7.586"
        x2="7.586"
        y2="4.664"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        data-color="color-2"
      ></line>
      <line
        x1="10.414"
        y1="4.664"
        x2="13.336"
        y2="7.586"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        data-color="color-2"
      ></line>
      <line
        x1="13.336"
        y1="10.414"
        x2="10.414"
        y2="13.336"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        data-color="color-2"
      ></line>
      <line
        x1="7.586"
        y1="13.336"
        x2="4.664"
        y2="10.414"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        data-color="color-2"
      ></line>
      <circle
        cx="9"
        cy="3.25"
        r="2"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      ></circle>
      <circle
        cx="3.25"
        cy="9"
        r="2"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      ></circle>
      <circle
        cx="9"
        cy="14.75"
        r="2"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      ></circle>
      <circle
        cx="14.75"
        cy="9"
        r="2"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      ></circle>
    </svg>
  );
}

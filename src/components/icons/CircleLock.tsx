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

export function CircleLock({ color = '#000', size = '18px' }: Props) {
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
      <circle
        cx="9"
        cy="9"
        r="7.25"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      ></circle>
      <circle
        cx="9"
        cy="8.25"
        r="2"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        data-color="color-2"
      ></circle>
      <line
        x1="9"
        y1="10.25"
        x2="9"
        y2="12.5"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        data-color="color-2"
      ></line>
    </svg>
  );
}

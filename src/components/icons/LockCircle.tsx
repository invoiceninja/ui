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
  fillColor?: string;
}

export function LockCircle({
  color = '#000',
  size = '24px',
  fillColor = 'none',
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{
        color,
        width: size,
        height: size,
      }}
      viewBox="0 0 24 24"
    >
      <path
        d="m16,8v-3c0-2.209-1.791-4-4-4h0c-2.209,0-4,1.791-4,4v3"
        fill="none"
        stroke={color}
        stroke-miterlimit="10"
        stroke-width="2"
        data-color="color-2"
        data-cap="butt"
      ></path>
      <circle
        cx="12"
        cy="15"
        r="8"
        fill="none"
        stroke={color}
        stroke-linecap="square"
        stroke-miterlimit="10"
        stroke-width="2"
      ></circle>
      <line
        x1="12"
        y1="14"
        x2="12"
        y2="17"
        fill={fillColor}
        stroke={color}
        stroke-linecap="square"
        stroke-miterlimit="10"
        stroke-width="2"
        data-color="color-2"
      ></line>
      <circle
        cx="12"
        cy="14"
        r="1"
        fill="#000"
        stroke="#000"
        stroke-linecap="square"
        stroke-miterlimit="10"
        stroke-width="2"
        data-color="color-2"
      ></circle>
    </svg>
  );
}

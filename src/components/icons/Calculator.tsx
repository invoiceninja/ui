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

export function Calculator({ size = '1rem', color = '#000' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 18 18"
    >
      <rect
        x="3.75"
        y="1.75"
        width="10.5"
        height="14.5"
        rx="2"
        ry="2"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></rect>
      <circle
        cx="6.25"
        cy="11"
        r=".75"
        fill={color}
        data-color="color-2"
        data-stroke="none"
      ></circle>
      <circle
        cx="6.25"
        cy="8.25"
        r=".75"
        fill={color}
        data-color="color-2"
        data-stroke="none"
      ></circle>
      <circle
        cx="9"
        cy="8.25"
        r=".75"
        fill={color}
        data-color="color-2"
        data-stroke="none"
      ></circle>
      <circle
        cx="11.75"
        cy="8.25"
        r=".75"
        fill={color}
        data-color="color-2"
        data-stroke="none"
      ></circle>
      <circle
        cx="9"
        cy="11"
        r=".75"
        fill={color}
        data-color="color-2"
        data-stroke="none"
      ></circle>
      <circle
        cx="6.25"
        cy="13.75"
        r=".75"
        fill={color}
        data-color="color-2"
        data-stroke="none"
      ></circle>
      <circle
        cx="9"
        cy="13.75"
        r=".75"
        fill={color}
        data-color="color-2"
        data-stroke="none"
      ></circle>
      <rect
        x="6.25"
        y="4.25"
        width="5.5"
        height="1"
        fill={color}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></rect>
      <line
        x1="11.75"
        y1="11"
        x2="11.75"
        y2="13.75"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></line>
    </svg>
  );
}

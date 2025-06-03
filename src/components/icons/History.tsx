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
  filledColor?: string;
}

export function History({
  color = '#000',
  size = '1.2rem',
  filledColor = '#000',
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ height: size, width: size }}
      viewBox="0 0 18 18"
    >
      <circle
        cx="9"
        cy="9"
        r="7.25"
        fill={filledColor}
        fill-opacity="0.3"
        data-color="color-2"
        data-stroke="none"
      ></circle>
      <path
        d="M1.75 9C1.75 13.004 4.996 16.25 9 16.25C13.004 16.25 16.25 13.004 16.25 9C16.25 4.996 13.004 1.75 9 1.75C5.969 1.75 3.373 3.61 2.29 6.25"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
      <path
        d="M1.88 3.30499L2.288 6.24999L5.232 5.84299"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
      <path
        d="M9 4.75V9L12.25 11.25"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

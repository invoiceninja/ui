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
  strokeWidth?: string;
}

export function ArrowsOppositeDirection({
  color = '#000',
  size = '12px',
  strokeWidth = '1.5',
}: Props) {
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
      viewBox="0 0 12 12"
    >
      <line
        x1="5.25"
        y1="8.25"
        x2="11"
        y2="8.25"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={strokeWidth}
        data-color="color-2"
      ></line>
      <polyline
        points="8.75 5.75 11.25 8.25 8.75 10.75"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={strokeWidth}
        data-color="color-2"
      ></polyline>
      <line
        x1="6.75"
        y1="3.75"
        x2="1"
        y2="3.75"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={strokeWidth}
      ></line>
      <polyline
        points="3.25 1.25 .75 3.75 3.25 6.25"
        fill="none"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={strokeWidth}
      ></polyline>
    </svg>
  );
}

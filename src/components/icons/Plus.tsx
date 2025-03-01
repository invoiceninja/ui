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

export function Plus({ size = '1rem', color = '#A1A1AA' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
    >
      <line
        x1="10"
        y1="16.5"
        x2="10"
        y2="3.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></line>
      <line
        x1="3.5"
        y1="10"
        x2="16.5"
        y2="10"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      ></line>
    </svg>
  );
}

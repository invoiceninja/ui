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
  filledColor?: string;
}

export function MediaPlay({
  size = '1.2rem',
  color = '#000',
  filledColor = '#000',
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{
        height: size,
        width: size,
      }}
      viewBox="0 0 18 18"
    >
      <path
        d="M5.245 2.878L14.737 8.134C15.422 8.513 15.422 9.487 14.737 9.866L5.245 15.122C4.576 15.493 3.75 15.014 3.75 14.256V3.744C3.75 2.986 4.575 2.507 5.245 2.878Z"
        fill={filledColor}
        data-color="color-2"
        data-stroke="none"
      ></path>
      <path
        d="M5.245 2.878L14.737 8.134C15.422 8.513 15.422 9.487 14.737 9.866L5.245 15.122C4.576 15.493 3.75 15.014 3.75 14.256V3.744C3.75 2.986 4.575 2.507 5.245 2.878Z"
        stroke={color}
        strokeWidth="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

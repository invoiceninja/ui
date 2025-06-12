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
  filledColor?: string;
  size?: string;
}

export function CopyToClipboard({
  color = '#000',
  filledColor = '#000',
  size = '1.2rem',
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 18 18"
    >
      <path
        d="M6.75 15.25L14.25 15.25C15.3546 15.25 16.25 14.3546 16.25 13.25V7.75C16.25 6.64543 15.3546 5.75 14.25 5.75L6.75 5.75C5.64543 5.75 4.75 6.64543 4.75 7.75L4.75 13.25C4.75 14.3546 5.64543 15.25 6.75 15.25Z"
        fill={filledColor}
        fill-opacity="0.3"
        data-color="color-2"
        data-stroke="none"
      ></path>
      <path
        d="M4.75 12.25H3.75C2.645 12.25 1.75 11.355 1.75 10.25V4.75C1.75 3.645 2.645 2.75 3.75 2.75H11.25C12.355 2.75 13.25 3.645 13.25 4.75V5.75"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
      <path
        d="M6.75 15.25L14.25 15.25C15.3546 15.25 16.25 14.3546 16.25 13.25V7.75C16.25 6.64543 15.3546 5.75 14.25 5.75L6.75 5.75C5.64543 5.75 4.75 6.64543 4.75 7.75L4.75 13.25C4.75 14.3546 5.64543 15.25 6.75 15.25Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

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

export function Toggle({ size = '1rem', color = '#000' }: Props) {
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
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.75 9C10.75 11.6234 8.62335 13.75 6 13.75H12C14.6234 13.75 16.75 11.6234 16.75 9C16.75 6.37665 14.6234 4.25 12 4.25H6C8.62335 4.25 10.75 6.37665 10.75 9Z"
        fill={color}
        fill-opacity="0.3"
        data-color="color-2"
        data-stroke="none"
      ></path>
      <path
        d="M6 13.75H12C14.623 13.75 16.75 11.623 16.75 9C16.75 6.377 14.623 4.25 12 4.25H6"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
      <path
        d="M6 13.75C8.62335 13.75 10.75 11.6234 10.75 9C10.75 6.37665 8.62335 4.25 6 4.25C3.37665 4.25 1.25 6.37665 1.25 9C1.25 11.6234 3.37665 13.75 6 13.75Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

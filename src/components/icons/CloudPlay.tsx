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

export function CloudPlay({
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
        d="M13.464 6.891C13.278 4.577 11.362 2.75 9 2.75C6.515 2.75 4.5 4.765 4.5 7.25C4.5 7.6 4.549 7.936 4.624 8.263C3.027 8.33 1.75 9.637 1.75 11.25C1.75 12.907 3.093 14.25 4.75 14.25H12.5C14.571 14.25 16.25 12.571 16.25 10.5C16.25 8.764 15.065 7.318 13.464 6.891Z"
        fill={filledColor}
        data-color="color-2"
        fillOpacity="0.3"
        data-stroke="none"
      ></path>
      <path
        d="M10.715 8.48199L8.407 7.09699C8.004 6.85499 7.491 7.14499 7.491 7.61499V10.386C7.491 10.856 8.004 11.146 8.407 10.904L10.715 9.51899C11.106 9.28399 11.106 8.71699 10.715 8.48199Z"
        fill={color}
        data-stroke="none"
      ></path>
      <path
        d="M13.464 6.891C13.278 4.577 11.362 2.75 9 2.75C6.515 2.75 4.5 4.765 4.5 7.25C4.5 7.6 4.549 7.936 4.624 8.263C3.027 8.33 1.75 9.637 1.75 11.25C1.75 12.907 3.093 14.25 4.75 14.25H12.5C14.571 14.25 16.25 12.571 16.25 10.5C16.25 8.764 15.065 7.318 13.464 6.891Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

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

export function MediaPause({
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
        d="M5.25 2.75H3.75C3.19772 2.75 2.75 3.19772 2.75 3.75V14.25C2.75 14.8023 3.19772 15.25 3.75 15.25H5.25C5.80228 15.25 6.25 14.8023 6.25 14.25V3.75C6.25 3.19772 5.80228 2.75 5.25 2.75Z"
        fill={filledColor}
        data-color="color-2"
        data-stroke="none"
      ></path>
      <path
        d="M14.25 2.75H12.75C12.1977 2.75 11.75 3.19772 11.75 3.75V14.25C11.75 14.8023 12.1977 15.25 12.75 15.25H14.25C14.8023 15.25 15.25 14.8023 15.25 14.25V3.75C15.25 3.19772 14.8023 2.75 14.25 2.75Z"
        fill={filledColor}
        data-color="color-2"
        data-stroke="none"
      ></path>
      <path
        d="M5.25 2.75H3.75C3.19772 2.75 2.75 3.19772 2.75 3.75V14.25C2.75 14.8023 3.19772 15.25 3.75 15.25H5.25C5.80228 15.25 6.25 14.8023 6.25 14.25V3.75C6.25 3.19772 5.80228 2.75 5.25 2.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M14.25 2.75H12.75C12.1977 2.75 11.75 3.19772 11.75 3.75V14.25C11.75 14.8023 12.1977 15.25 12.75 15.25H14.25C14.8023 15.25 15.25 14.8023 15.25 14.25V3.75C15.25 3.19772 14.8023 2.75 14.25 2.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

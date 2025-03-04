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

export function FileEdit({ size = '1.2rem', color = '#000' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
    >
      <path
        d="M20 8.4124V4C20 2.89543 19.1046 2 18 2H11.0784C10.548 2 10.0393 2.21071 9.66421 2.58579L4.58579 7.66421C4.21071 8.03929 4 8.54799 4 9.07843L4 20C4 21.1046 4.89543 22 6 22H9"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
        fill="none"
      ></path>
      <path
        d="M4 9H11V2"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        data-cap="butt"
        fill="none"
      ></path>
      <path
        d="M16 22L22 16C22.8284 15.1716 22.8284 13.8284 22 13C21.1716 12.1716 19.8284 12.1716 19 13L13 19V22H16Z"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
        data-color="color-2"
        fill="none"
      ></path>
    </svg>
  );
}

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

export function CloudUpload({ size = '1.2rem', color = '#000' }: Props) {
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
      viewBox="0 0 24 24"
    >
      <path
        d="M11.9999 21L11.9999 10L12 10.5"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        data-color="color-2"
        fill="none"
      ></path>
      <path
        d="M16.2427 14.2428L12 10.0001L7.75739 14.2428"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        data-color="color-2"
        fill="none"
      ></path>
      <path
        d="M7 19H5C2.8 19 1 17.2 1 15C1 13.1 2.3 11.5 4 11.1C4.2 7.2 7.5 4 11.5 4C15.5 4 18.7 7.1 19 11C21.2 11 23 12.8 23 15C23 17.2 21.2 19 19 19H17"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        fill="none"
      ></path>
    </svg>
  );
}

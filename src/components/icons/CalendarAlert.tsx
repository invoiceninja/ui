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
  exclamationMarkColor?: string;
}

export function CalendarAlert({
  size = '1.2rem',
  color = '#000',
  exclamationMarkColor = '#000',
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
        d="M2.25 4.75C2.25 3.64543 3.14543 2.75 4.25 2.75H13.75C14.8546 2.75 15.75 3.64543 15.75 4.75V6.25H2.25V4.75Z"
        fill={color}
        fillOpacity="0.3"
        data-color="color-2"
        data-stroke="none"
      ></path>
      <path
        d="M5.75 2.75V0.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M12.25 2.75V0.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M2.25 6.25H15.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M12.25 14V11.25"
        stroke={exclamationMarkColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M12.25 17C12.6642 17 13 16.6642 13 16.25C13 15.8358 12.6642 15.5 12.25 15.5C11.8358 15.5 11.5 15.8358 11.5 16.25C11.5 16.6642 11.8358 17 12.25 17Z"
        fill={exclamationMarkColor}
        data-stroke="none"
      ></path>
      <path
        d="M14.479 15.108C15.222 14.816 15.75 14.097 15.75 13.25V4.75C15.75 3.646 14.855 2.75 13.75 2.75H4.25C3.145 2.75 2.25 3.646 2.25 4.75V13.25C2.25 14.354 3.145 15.25 4.25 15.25H9.962"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

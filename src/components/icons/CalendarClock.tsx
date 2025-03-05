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
  clockColor?: string;
}

export function CalendarClock({
  size = '1.2rem',
  color = '#000',
  clockColor = '#000',
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
        d="M14 17.25C15.7949 17.25 17.25 15.7949 17.25 14C17.25 12.2051 15.7949 10.75 14 10.75C12.2051 10.75 10.75 12.2051 10.75 14C10.75 15.7949 12.2051 17.25 14 17.25Z"
        fill={clockColor}
        fillOpacity="0.3"
        data-color="color-2"
        data-stroke="none"
      ></path>
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
        d="M15.75 8.524V4.75C15.75 3.646 14.855 2.75 13.75 2.75H4.25C3.145 2.75 2.25 3.646 2.25 4.75V13.25C2.25 14.354 3.145 15.25 4.25 15.25H8.391"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M14 17.25C15.7949 17.25 17.25 15.7949 17.25 14C17.25 12.2051 15.7949 10.75 14 10.75C12.2051 10.75 10.75 12.2051 10.75 14C10.75 15.7949 12.2051 17.25 14 17.25Z"
        stroke={clockColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M15.156 14.476L14 14V12.75"
        stroke={clockColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

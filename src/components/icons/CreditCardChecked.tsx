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

export function CreditCardChecked({ size = '1.2rem', color = '#000' }: Props) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75 14.25H10.0499C10.1349 13.8752 10.3172 13.5171 10.5982 13.2157C11.3775 12.3799 12.6442 12.2705 13.5497 12.9173L15.4542 10.3944C15.6722 10.1056 15.9464 9.88418 16.25 9.73389V7.25H1.75V12.25C1.75 13.3546 2.64543 14.25 3.75 14.25Z"
        fill={color}
        fillOpacity="0.3"
        data-color="color-2"
        data-stroke="none"
      ></path>
      <path
        d="M1.75 7.25H16.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M4.25 11.25H7.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M16.25 9.471V5.75C16.25 4.646 15.355 3.75 14.25 3.75H3.75C2.645 3.75 1.75 4.646 1.75 5.75V12.25C1.75 13.354 2.645 14.25 3.75 14.25H9.802"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M12.244 14.75L13.853 16.25L17.25 11.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

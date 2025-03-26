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
  filledColor?: string;
  borderColor?: string;
  size?: string;
}

export function RadioChecked({
  size = '1.2rem',
  filledColor = '#000',
  borderColor = '#000',
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
        d="M9.00009 17C13.4184 17 17.0001 13.4183 17.0001 9C17.0001 4.58172 13.4184 1 9.00009 1C4.58181 1 1.00009 4.58172 1.00009 9C1.00009 13.4183 4.58181 17 9.00009 17Z"
        fill={borderColor}
      ></path>
      <path
        d="M9.00009 13C11.2092 13 13.0001 11.2091 13.0001 9C13.0001 6.79086 11.2092 5 9.00009 5C6.79095 5 5.00009 6.79086 5.00009 9C5.00009 11.2091 6.79095 13 9.00009 13Z"
        fill={filledColor}
      ></path>
    </svg>
  );
}

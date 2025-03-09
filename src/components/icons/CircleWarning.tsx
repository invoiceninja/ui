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
  size?: string;
}

export function CircleWarning(props: Props) {
  const { color = '#000', size = '1.2rem' } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeLinecap="square"
        strokeMiterlimit="10"
        strokeWidth="2"
      ></circle>
      <line
        x1="12"
        y1="7"
        x2="12"
        y2="13"
        fill="none"
        stroke={color}
        strokeLinecap="square"
        strokeMiterlimit="10"
        strokeWidth="2"
        data-color="color-2"
      ></line>
      <circle
        cx="12"
        cy="16.75"
        r="1.25"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
        data-cap="butt"
      ></circle>
    </svg>
  );
}

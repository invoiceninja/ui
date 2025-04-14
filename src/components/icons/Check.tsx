/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

type Props = {
  color?: string;
  size?: string;
};

export function Check({ color = '#000', size = '1.1rem' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 12 12"
    >
      <path
        d="m1.75,6c1.047,1.048,1.803,2.153,2.461,3.579,1.524-3.076,3.659-5.397,6.039-7.158"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
    </svg>
  );
}

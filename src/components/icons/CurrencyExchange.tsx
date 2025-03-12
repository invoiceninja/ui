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

export function CurrencyExchange(props: Props) {
  const { size = '1rem', color = '#000' } = props;

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
        d="m16.12,14.695l-.408-2.945h-.002c-1.083,2.64-3.68,4.5-6.71,4.5-4.004,0-7.25-3.246-7.25-7.25"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <path
        d="m1.88,3.305l.408,2.945h.002C3.373,3.61,5.969,1.75,9,1.75c4.004,0,7.25,3.246,7.25,7.25"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <ellipse
        cx="9"
        cy="7.75"
        rx="3.75"
        ry="2"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></ellipse>
      <path
        d="m5.25,7.75v2.5c0,1.1045,1.679,2,3.75,2s3.75-.8955,3.75-2v-2.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></path>
    </svg>
  );
}

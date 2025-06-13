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

export function GridDotsVertical({ size = '1.2rem', color = '#000' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 18 18"
    >
      <circle
        cx="6.75"
        cy="9"
        r="1.25"
        fill={color}
        data-color="color-2"
      ></circle>
      <circle cx="6.75" cy="3.75" r="1.25" fill={color}></circle>
      <circle cx="6.75" cy="14.25" r="1.25" fill={color}></circle>
      <circle
        cx="11.25"
        cy="9"
        r="1.25"
        fill={color}
        data-color="color-2"
      ></circle>
      <circle cx="11.25" cy="3.75" r="1.25" fill={color}></circle>
      <circle cx="11.25" cy="14.25" r="1.25" fill={color}></circle>
    </svg>
  );
}

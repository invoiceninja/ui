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

export function ClipboardCheck(props: Props) {
  const { size = '1rem', color = '#000' } = props;

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
        d="m7.75,1.75h.5c1.105,0,2,.895,2,2v5.5c0,1.105-.895,2-2,2H3.75c-1.105,0-2-.895-2-2V3.75c0-1.105.895-2,2-2h.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <rect
        x="4.25"
        y=".75"
        width="3.5"
        height="2.5"
        rx=".5"
        ry=".5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></rect>
      <polyline
        points="4 7.39 5.334 8.722 8 5.171"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></polyline>
    </svg>
  );
}

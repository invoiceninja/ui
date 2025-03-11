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

export function Pencil({ size = '1.2rem', color = '#FFF' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 18 18"
    >
      <path
        d="M13.953,7.578l1.109-1.109c.586-.586,.586-1.536,0-2.121l-1.409-1.409c-.586-.586-1.536-.586-2.121,0l-1.109,1.109,3.53,3.53Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></path>
      <path
        d="M8.922,5.547l-4.775,4.775c-.25,.25-.429,.562-.52,.904l-1.127,4.273h0s4.273-1.127,4.273-1.127c.342-.09,.654-.27,.904-.52l4.775-4.775"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <line
        x1="10.672"
        y1="7.297"
        x2="6.265"
        y2="11.704"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></line>
    </svg>
  );
}

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

export function TriangleWarning(props: Props) {
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
      <path
        d="m22.596,17.346L14.697,3.562c-.561-.979-1.569-1.562-2.697-1.562s-2.136.584-2.697,1.562L1.404,17.346c-.558.974-.555,2.134.008,3.104.562.971,1.568,1.55,2.689,1.55h15.798c1.122,0,2.127-.579,2.689-1.55.562-.971.565-2.131.008-3.104Zm-11.596-9.346h2v6h-2v-6Zm1,10c-.689,0-1.25-.561-1.25-1.25s.561-1.25,1.25-1.25,1.25.561,1.25,1.25-.561,1.25-1.25,1.25Z"
        strokeWidth="0"
        fill={color}
      ></path>
    </svg>
  );
}

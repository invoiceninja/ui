/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Params {
  size?: string;
  color?: string;
  withoutColor?: boolean;
}

export function ChevronDown(props: Params) {
  const { color = '#000', size = '1.2rem', withoutColor = false } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
    >
      <polyline
        points="3.5 7.5 10 14 16.5 7.5"
        fill="none"
        {...(!withoutColor && { stroke: color })}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      ></polyline>
    </svg>
  );
}

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

export function DoubleChevronRight({ size = '1.2rem', color = '#000' }: Props) {
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
        d="m6.25,10.75c-.192,0-.384-.073-.53-.22-.293-.293-.293-.768,0-1.061l3.47-3.47-3.47-3.47c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l4,4c.293.293.293.768,0,1.061l-4,4c-.146.146-.338.22-.53.22Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
      <path
        d="m1.75,10.75c-.192,0-.384-.073-.53-.22-.293-.293-.293-.768,0-1.061l3.47-3.47L1.22,2.53c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l4,4c.293.293.293.768,0,1.061l-4,4c-.146.146-.338.22-.53.22Z"
        strokeWidth="0"
        fill={color}
      ></path>
    </svg>
  );
}

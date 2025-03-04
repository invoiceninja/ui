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

export function Sun(props: Props) {
  const { color = '#000', size = '1.2rem' } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 12 12"
    >
      <circle cx="6" cy="6" r="3" strokeWidth="0" fill={color}></circle>
      <path
        d="m6,2.25c-.414,0-.75-.336-.75-.75v-.75c0-.414.336-.75.75-.75s.75.336.75.75v.75c0,.414-.336.75-.75.75Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
      <path
        d="m9.182,3.568c-.192,0-.384-.073-.53-.22-.293-.293-.293-.768,0-1.061l.53-.53c.293-.293.768-.293,1.061,0s.293.768,0,1.061l-.53.53c-.146.146-.338.22-.53.22Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
      <path
        d="m11.25,6.75h-.75c-.414,0-.75-.336-.75-.75s.336-.75.75-.75h.75c.414,0,.75.336.75.75s-.336.75-.75.75Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
      <path
        d="m9.712,10.462c-.192,0-.384-.073-.53-.22l-.53-.53c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l.53.53c.293.293.293.768,0,1.061-.146.146-.338.22-.53.22Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
      <path
        d="m6,12c-.414,0-.75-.336-.75-.75v-.75c0-.414.336-.75.75-.75s.75.336.75.75v.75c0,.414-.336.75-.75.75Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
      <path
        d="m2.288,10.462c-.192,0-.384-.073-.53-.22-.293-.293-.293-.768,0-1.061l.53-.53c.293-.293.768-.293,1.061,0s.293.768,0,1.061l-.53.53c-.146.146-.338.22-.53.22Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
      <path
        d="m1.5,6.75h-.75c-.414,0-.75-.336-.75-.75s.336-.75.75-.75h.75c.414,0,.75.336.75.75s-.336.75-.75.75Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
      <path
        d="m2.818,3.568c-.192,0-.384-.073-.53-.22l-.53-.53c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l.53.53c.293.293.293.768,0,1.061-.146.146-.338.22-.53.22Z"
        fill={color}
        strokeWidth="0"
        data-color="color-2"
      ></path>
    </svg>
  );
}

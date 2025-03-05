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

export function Search({ color = '#000', size = '1.3rem' }: Props) {
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
        d="M15.25,16c-.192,0-.384-.073-.53-.22l-3.965-3.965c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l3.965,3.965c.293,.293,.293,.768,0,1.061-.146,.146-.338,.22-.53,.22Z"
        fill={color}
        data-color="color-2"
      ></path>
      <path
        d="M7.75,13.5c-3.17,0-5.75-2.58-5.75-5.75S4.58,2,7.75,2s5.75,2.58,5.75,5.75-2.58,5.75-5.75,5.75Zm0-10c-2.343,0-4.25,1.907-4.25,4.25s1.907,4.25,4.25,4.25,4.25-1.907,4.25-4.25-1.907-4.25-4.25-4.25Z"
        fill={color}
      ></path>
    </svg>
  );
}

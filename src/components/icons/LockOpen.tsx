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

export function LockOpen({ size = '1.2rem', color = '#000' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{
        width: size,
        height: size,
      }}
      viewBox="0 0 18 18"
    >
      <path
        d="M7.25,9c-.414,0-.75-.336-.75-.75v-3.25c0-1.378-1.122-2.5-2.5-2.5S1.5,3.622,1.5,5v1.25c0,.414-.336,.75-.75,.75s-.75-.336-.75-.75v-1.25C0,2.794,1.794,1,4,1s4,1.794,4,4v3.25c0,.414-.336,.75-.75,.75Z"
        fill={color}
        data-color="color-2"
      ></path>
      <path
        d="M13.25,7.5H5.75c-1.517,0-2.75,1.233-2.75,2.75v4c0,1.517,1.233,2.75,2.75,2.75h7.5c1.517,0,2.75-1.233,2.75-2.75v-4c0-1.517-1.233-2.75-2.75-2.75Zm-3,5.25c0,.414-.336,.75-.75,.75s-.75-.336-.75-.75v-1c0-.414,.336-.75,.75-.75s.75,.336,.75,.75v1Z"
        fill={color}
      ></path>
    </svg>
  );
}

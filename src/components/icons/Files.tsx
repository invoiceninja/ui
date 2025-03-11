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

export function Files(props: Props) {
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
        d="M5.25,13.25h-1c-1.105,0-2-.895-2-2V3.25c0-1.105,.895-2,2-2h5c1.105,0,2,.895,2,2v1.052"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></path>
      <path
        d="M5.25,14.25V6.25c0-1.105,.895-2,2-2h4.086c.265,0,.52,.105,.707,.293l2.914,2.914c.188,.188,.293,.442,.293,.707v6.086c0,1.105-.895,2-2,2H7.25c-1.105,0-2-.895-2-2Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <path
        d="M15.25,8.25h-3c-.552,0-1-.448-1-1v-3"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
    </svg>
  );
}

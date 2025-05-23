/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';

interface Props {
  size?: string;
  color?: string;
}

export function Settings({ size = '1.2rem', color = '#000' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
    >
      <path
        d="m17.447,8.605l-1.278-.639c-.101-.307-.227-.602-.371-.887l.453-1.359c.12-.359.026-.756-.241-1.023l-.707-.707c-.267-.268-.664-.362-1.023-.242l-1.36.453c-.285-.144-.58-.269-.887-.371l-.639-1.278c-.17-.339-.516-.553-.895-.553h-1c-.379,0-.725.214-.895.553l-.639,1.278c-.307.101-.602.227-.887.371l-1.36-.453c-.359-.12-.756-.026-1.023.242l-.707.707c-.268.268-.361.664-.241,1.023l.453,1.359c-.144.285-.269.58-.371.887l-1.278.639c-.339.169-.553.516-.553.895v1c0,.379.214.725.553.895l1.278.639c.101.307.227.602.371.887l-.453,1.359c-.12.359-.026.756.241,1.023l.707.707c.19.191.446.293.707.293.105,0,.213-.017.316-.051l1.36-.453c.285.144.58.269.887.371l.639,1.278c.17.339.516.553.895.553h1c.379,0,.725-.214.895-.553l.639-1.278c.307-.101.602-.227.887-.371l1.36.453c.104.035.211.051.316.051.261,0,.517-.103.707-.293l.707-.707c.268-.268.361-.664.241-1.023l-.453-1.359c.144-.285.269-.58.371-.887l1.278-.639c.339-.169.553-.516.553-.895v-1c0-.379-.214-.725-.553-.895Zm-7.447,4.395c-1.657,0-3-1.343-3-3s1.343-3,3-3,3,1.343,3,3-1.343,3-3,3Z"
        strokeWidth="0"
        fill={color}
      ></path>
    </svg>
  );
}

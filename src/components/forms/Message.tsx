/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from "classnames";

interface Props {
  classNames?: string;
  children: any;
  type?: "green" | "red";
}

export function Message(props: Props) {
  return (
    <div
      className={classNames(
        `bg-gray-100 text-sm pl-2 py-1 border-l-2 ${props.classNames}`,
        {
          "border-green-400": props.type === "green",
          "border-red-400": props.type === "red",
        }
      )}
    >
      {props.children}
    </div>
  );
}

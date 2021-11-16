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
import Loading from "../icons/Loading";

interface Props {
  block?: boolean;
  children?: any;
  type?: string | "button";
  busy?: boolean;
}

export function Button(props: any) {
  return (
    <button
      disabled={props.busy}
      type={props.type}
      className={
        "flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 " +
        classNames({
          "w-full": props.block,
        })
      }
    >
      {props.busy ? <Loading /> : props.children}
    </button>
  );
}

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
  type?: "submit" | "button";
  busy?: boolean;
  variant?: "primary" | "secondary";
}

const defaultProps: Props = {
  variant: "primary",
};

export function Button(props: Props) {
  props = { ...defaultProps, ...props };

  return (
    <button
      disabled={props.busy}
      type={props.type}
      className={
        "inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ffocus:ring-indigo-500 " +
        classNames({
          "w-full": props.block,
          "text-white bg-indigo-600 hover:bg-indigo-700":
            props.variant === "primary",
          "text-gray-700 bg-white hover:bg-gray-50":
            props.variant === "secondary",
        })
      }
    >
      {props.busy ? (
        <Loading variant={props.variant === "primary" ? "light" : "dark"} />
      ) : (
        props.children
      )}
    </button>
  );
}

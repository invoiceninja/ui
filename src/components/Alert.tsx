/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from "react";
import classNames from "classnames";
import CommonProps from "../common/interfaces/common-props.interface";

interface Props extends CommonProps {
  type?: "success" | "warning" | "danger";
}

export function Alert(props: Props) {
  return (
    <div
      className={classNames(`border-l-4 py-2 ${props.className}`, {
        "bg-red-50 border-red-500": props.type === "danger",
        "bg-yellow-50 border-yellow-500": props.type === "warning",
        "bg-green-50 border-green-500": props.type === "success",
      })}
    >
      <div className="ml-3">
        <p
          className={classNames("text-sm", {
            "text-red-700": props.type === "danger",
            "text-yellow-700": props.type === "warning",
            "text-green-700": props.type === "success",
          })}
        >
          {props.children}
        </p>
      </div>
    </div>
  );
}

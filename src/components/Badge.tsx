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
import React from "react";
import { useSelector } from "react-redux";
import CommonProps from "../common/interfaces/common-props.interface";
import { RootState } from "../common/stores/store";

interface Props extends CommonProps {
  variant?: "primary" | "white" | "yellow" | "red" | "generic";
}

const defaultProps: Props = {
  variant: "generic",
};

export function Badge(props: Props) {
  props = { ...defaultProps, ...props };
  const colors = useSelector((state: RootState) => state.settings.colors);

  const styles: React.CSSProperties = {};

  if (props.variant === "primary") {
    styles.backgroundColor = colors.primary;
    styles.color = "white";
  }

  return (
    <span
      style={styles}
      className={classNames("text-xs px-2 py-1 rounded border", {
        "bg-gray-50": props.variant === "generic",
        "bg-white": props.variant === "white",
        "bg-yellow-600 text-white": props.variant === "yellow",
        "bg-red-600 text-white": props.variant === "red",
      })}
    >
      {props.children}
    </span>
  );
}

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
import CommonProps from "../../common/interfaces/common-props.interface";
import { RootState } from "../../common/stores/store";
import { InputLabel } from "./InputLabel";

interface Props extends CommonProps {
  label?: string;
  id: string;
  type?: string;
  placeholder?: string;
}

export function InputField(props: Props) {
  const colors = useSelector((state: RootState) => state.settings.colors);

  return (
    <section>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
          {props.label}
        </InputLabel>
      )}

      <input
        id={props.id}
        type={props.type}
        className={classNames(
          `w-full py-2 px-3 rounded border border-gray-300 focus:outline-none text-sm ${props.className}`,
          {
            [`focus:border-${colors.primary}`]: colors.isClass,
          }
        )}
        placeholder={props.placeholder}
        onChange={props.onChange}
      />
    </section>
  );
}

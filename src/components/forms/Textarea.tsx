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
import CommonProps from "../../common/interfaces/common-props.interface";
import { InputLabel } from "./InputLabel";

interface Props extends CommonProps {
  label?: string;
  placeholder?: string;
  rows?: number | undefined;
}

export function Textarea(props: Props) {
  return (
    <section>
      {props.label && (
        <InputLabel className="mb-2" for={props.id}>
          {props.label}
        </InputLabel>
      )}

      <textarea
        rows={props.rows ?? 5}
        id={props.id}
        className={`form-textarea w-full py-2 px-3 rounded border border-gray-300 text-sm ${props.className}`}
        placeholder={props.placeholder}
        onChange={props.onChange}
      >
        {props.children}
      </textarea>
    </section>
  );
}

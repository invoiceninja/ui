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

interface Props extends CommonProps {}

export function Th(props: Props) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
      {props.children}
    </th>
  );
}

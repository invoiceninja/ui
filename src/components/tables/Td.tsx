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

export function Td(props: Props) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {props.children}
    </td>
  );
}

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
import { Spinner } from "../Spinner";
import { Td } from "./Td";

interface Props extends CommonProps {
  isLoading?: boolean;
}

export function Tr(props: Props) {
  return (
    <tr className="bg-white hover:bg-gray-50">
      {props.isLoading ? (
        <Td colSpan={100}>
          <Spinner />
        </Td>
      ) : (
        props.children
      )}
    </tr>
  );
}

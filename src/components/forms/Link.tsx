/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from "react-router-dom";

interface Props {
  to: string;
  children?: any;
}

export function LinkStyled(props: Props) {
  return (
    <Link
      to={props.to}
      className="font-medium text-indigo-600 hover:text-indigo-500"
    >
      {props.children}
    </Link>
  );
}

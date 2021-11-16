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
  className?: string;
  target?: string;
}

export function LinkStyled(props: Props) {
  return (
    <Link
      to={props.to}
      className={`font-medium text-indigo-600 hover:text-indigo-500 ${props.className}`}
    >
      {props.children}
    </Link>
  );
}

export function LinkExternal(props: Props) {
  return (
    <a
      className={`font-medium text-indigo-600 hover:text-indigo-500 ${props.className}`}
      href={props.to}
      target={props.target ?? "_self"}
    >
      {props.children}
    </a>
  );
}

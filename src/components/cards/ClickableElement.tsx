/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  to?: string;
  href?: string;
}

export function ClickableElement(props: Props) {
  const classes = `block w-full text-left px-4 sm:px-6 block hover:bg-gray-50 py-4 space-x-3 text-gray-700 hover:text-gray-900 text-sm ${props.className}`;

  if (props.to) {
    return (
      <Link to={props.to} className={classes}>
        {props.children}
      </Link>
    );
  }

  if (props.href) {
    return (
      <a target="_blank" href={props.href} className={classes} rel="noreferrer">
        {props.children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      onChange={props.onChange}
      className={classes}
    >
      {props.children}
    </button>
  );
}

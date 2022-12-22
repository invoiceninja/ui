/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  to?: string;
  setVisible?: (value: boolean) => any;
  icon?: ReactElement;
}

export function DropdownElement(props: Props) {
  if (props.to) {
    return (
      <Link
        to={props.to}
        className={classNames(
          {
            'flex items-center': props.icon,
          },
          `w-full text-left hover:bg-gray-100 z-50 block px-4 py-2 text-sm text-gray-700 ${props.className}`
        )}
      >
        {props.icon}
        <div
          className={classNames({
            'ml-2': props.icon,
          })}
        >
          {props.children}
        </div>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        props.onClick?.(event);
        props.setVisible?.(false);
      }}
      ref={props.innerRef}
      className={classNames(
        {
          'flex items-center': props.icon,
        },
        `w-full text-left hover:bg-gray-100 z-50 block px-4 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 ${props.className} `
      )}
    >
      {props.icon}
      <div
        className={classNames({
          'ml-2': props.icon,
        })}
      >
        {props.children}
      </div>
    </button>
  );
}

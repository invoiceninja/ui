/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { useAccentColor } from 'common/hooks/useAccentColor';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';
import { Spinner } from '../Spinner';

interface Props extends CommonProps {
  children?: ReactNode;
  variant?: 'block';
  disabled?: boolean;
  type?: 'primary' | 'secondary' | 'minimal';
  onClick?: any;
  to?: string;
  behavior?: 'button' | 'submit';
}

const defaultProps: Props = {
  type: 'primary',
  behavior: 'submit',
};

export function Button(props: Props) {
  props = { ...defaultProps, ...props };

  const accentColor = useAccentColor();

  const css: React.CSSProperties = {
    backgroundColor: props.type === 'primary' ? accentColor : 'white',
    color:
      props.type === 'primary'
        ? 'white'
        : props.type === 'secondary'
        ? 'text-gray-900'
        : accentColor,
  };

  if (props.to) {
    return (
      <Link
        to={props.to}
        className={classNames(
          `inline-flex items-center space-x-2 justify-center py-2 px-4 rounded text-sm text-gray-900 ${props.className}`,
          {
            'w-full': props.variant === 'block',
            'text-white': props.type == 'primary',
            'text-gray-900 border border-gray-300': props.type == 'secondary',
            'border-gray-600': props.type == 'minimal',
          }
        )}
        style={css}
      >
        {props.disabled ? <Spinner variant="light" /> : props.children}
      </Link>
    );
  }

  return (
    <button
      type={props.behavior}
      disabled={props.disabled}
      className={classNames(
        `inline-flex items-center space-x-2 justify-center rounded text-sm ${props.className}`,
        {
          'py-2 px-4': props.type !== 'minimal',
          'w-full': props.variant === 'block',
          'text-white': props.type === 'primary',
          'text-gray-900 border border-gray-300': props.type === 'secondary',
          'p-0 m-0': props.type === 'minimal',
        }
      )}
      style={css}
      onClick={props.onClick}
    >
      {props.disabled ? <Spinner variant="light" /> : props.children}
    </button>
  );
}

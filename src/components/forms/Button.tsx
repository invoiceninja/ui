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
import { produceWithPatches } from 'immer';
import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';
import { RootState } from '../../common/stores/store';
import { Spinner } from '../Spinner';

interface Props extends CommonProps {
  children?: ReactNode;
  variant?: 'block';
  disabled?: boolean;
  type?: 'primary' | 'secondary';
  onClick?: any;
  to?: string;
  behaviour?: 'button' | 'submit';
}

const defaultProps: Props = {
  type: 'primary',
  behaviour: 'submit',
};

export function Button(props: Props) {
  props = { ...defaultProps, ...props };

  const colors = useSelector((state: RootState) => state.settings.colors);

  const css: React.CSSProperties = {
    backgroundColor: props.type === 'primary' ? colors.primary : 'white',
  };

  if (props.to) {
    return (
      <Link
        to={props.to}
        className={classNames(
          `inline-flex items-center space-x-2 justify-center py-2 px-4 rounded text-sm ${props.className}`,
          {
            'w-full': props.variant === 'block',
            'text-white': props.type == 'primary',
            'text-gray-900 border border-gray-300': props.type == 'secondary',
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
      type={props.behaviour}
      disabled={props.disabled}
      className={classNames(
        `inline-flex items-center space-x-2 justify-center py-2 px-4 rounded text-sm ${props.className}`,
        {
          'w-full': props.variant === 'block',
          'text-white': props.type == 'primary',
          'text-gray-900 border border-gray-300': props.type == 'secondary',
        }
      )}
      style={css}
      onClick={props.onClick}
    >
      {props.disabled ? <Spinner variant="light" /> : props.children}
    </button>
  );
}

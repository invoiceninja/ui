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
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';
import { Spinner } from '../Spinner';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';

interface Props extends CommonProps {
  children?: ReactNode;
  variant?: 'block';
  disabled?: boolean;
  type?: 'primary' | 'secondary' | 'minimal';
  onClick?: any;
  to?: string;
  behavior?: 'button' | 'submit';
  disableWithoutIcon?: boolean;
  noBackgroundColor?: boolean;
  form?: string;
}

const defaultProps: Props = {
  type: 'primary',
  behavior: 'submit',
};

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.color} !important;
  background-color: ${(props) => props.theme.backgroundColor} !important;
  border-color: ${(props) => props.theme.borderColor} !important;
`;

const StyledButton = styled.button`
  color: ${(props) => props.theme.color} !important;
  border-color: ${(props) => props.theme.borderColor} !important;
  background-color: ${(props) => props.theme.backgroundColor} !important;

  &:hover {
    background-color: ${(props) => props.theme.hoverColor} !important;
  }
`;

export function Button(props: Props) {
  props = { ...defaultProps, ...props };

  const colors = useColorScheme();
  const accentColor = useAccentColor();

  const css: React.CSSProperties = {
    backgroundColor:
      props.type === 'primary'
        ? accentColor
        : props.noBackgroundColor
        ? 'transparent'
        : 'white',
    color:
      props.type !== 'primary' && props.type !== 'secondary' ? accentColor : '',
  };

  if (props.to) {
    return (
      <StyledLink
        to={props.to}
        theme={{
          backgroundColor: props.type === 'primary' ? colors.$18 : colors.$1,
          color: props.type === 'primary' ? colors.$1 : colors.$3,
          borderColor: props.type === 'primary' ? 'transparent' : colors.$24,
          hoverColor: props.type === 'primary' ? colors.$18 : colors.$4,
        }}
        className={classNames(
          `border inline-flex items-center space-x-2 px-4 shadow-sm justify-center rounded-md text-sm ${props.className}`,
          {
            'py-2 px-4': props.type !== 'minimal',
            'w-full': props.variant === 'block',
            'p-0 m-0': props.type === 'minimal',
            'opacity-75 pointer-events-none': props.disabled,
          }
        )}
        style={css}
      >
        {props.disabled && !props.disableWithoutIcon ? (
          <Spinner variant="light" />
        ) : (
          props.children
        )}
      </StyledLink>
    );
  }

  return (
    <StyledButton
      type={props.behavior}
      disabled={props.disabled}
      theme={{
        backgroundColor: props.type === 'primary' ? colors.$18 : colors.$1,
        color: props.type === 'primary' ? colors.$1 : colors.$3,
        borderColor: props.type === 'primary' ? 'transparent' : colors.$24,
        hoverColor: props.type === 'primary' ? colors.$18 : colors.$4,
      }}
      className={classNames(
        `border inline-flex items-center space-x-2 px-4 shadow-sm justify-center rounded-md text-sm ${props.className} disabled:cursor-not-allowed disabled:opacity-75`,
        {
          'py-2 px-4': props.type !== 'minimal',
          'w-full': props.variant === 'block',
          'p-0 m-0': props.type === 'minimal',
        }
      )}
      style={css}
      onClick={props.onClick}
      form={props.form}
    >
      {props.disabled && !props.disableWithoutIcon ? (
        <Spinner variant="light" />
      ) : (
        props.children
      )}
    </StyledButton>
  );
}

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
  background-color: ${(props) => props.theme.backgroundColor} !important;
  border-color: ${(props) => props.theme.borderColor} !important;
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
          backgroundColor: props.type === 'primary' ? accentColor : colors.$1,
          color: props.type === 'primary' ? colors.$9 : colors.$3,
          borderColor: props.type === 'primary' ? 'transparent' : colors.$5,
        }}
        className={classNames(
          `border inline-flex items-center space-x-2 px-4 justify-center rounded text-sm ${props.className} disabled:cursor-not-allowed disabled:opacity-75`,
          {
            'py-2 px-4': props.type !== 'minimal',
            'w-full': props.variant === 'block',
            'p-0 m-0': props.type === 'minimal',
          }
        )}
        style={css}
      >
        {props.disabled ? <Spinner variant="light" /> : props.children}
      </StyledLink>
    );
  }

  return (
    <StyledButton
      type={props.behavior}
      disabled={props.disabled}
      theme={{
        backgroundColor: props.type === 'primary' ? accentColor : colors.$1,
        color: props.type === 'primary' ? colors.$9 : colors.$3,
        borderColor: props.type === 'primary' ? 'transparent' : colors.$5,
      }}
      className={classNames(
        `border inline-flex items-center space-x-2 px-4 justify-center rounded text-sm ${props.className} disabled:cursor-not-allowed disabled:opacity-75`,
        {
          'py-2 px-4': props.type !== 'minimal',
          'w-full': props.variant === 'block',
          'p-0 m-0': props.type === 'minimal',
        }
      )}
      style={css}
      onClick={props.onClick}
    >
      {props.disabled && !props.disableWithoutIcon ? (
        <Spinner variant="light" />
      ) : (
        props.children
      )}
    </StyledButton>
  );
}

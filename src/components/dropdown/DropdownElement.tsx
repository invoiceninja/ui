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
import { useColorScheme } from '$app/common/colors';
import { styled } from 'styled-components';

interface Props extends CommonProps {
  to?: string;
  setVisible?: (value: boolean) => any;
  icon?: ReactElement;
  cypressRef?: string;
}

const Button = styled.button`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function DropdownElement(props: Props) {
  const colors = useColorScheme();

  if (props.to) {
    return (
      <StyledLink
        theme={{
          color: colors.$3,
          hoverColor: colors.$7,
        }}
        to={props.to}
        className={classNames(
          {
            'flex items-center': props.icon,
          },
          `w-full text-left z-50 block px-4 py-2 text-sm text-gray-700 rounded-lg ${props.className}`
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
      </StyledLink>
    );
  }

  return (
    <Button
      theme={{
        color: colors.$3,
        hoverColor: colors.$7,
      }}
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
        `w-full text-left z-50 block px-4 py-2 text-sm rounded-lg ${props.className} `
      )}
      data-cy={props.cypressRef}
    >
      {props.icon}
      <div
        className={classNames({
          'ml-2': props.icon,
        })}
      >
        {props.children}
      </div>
    </Button>
  );
}

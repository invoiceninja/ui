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
import { Link, useNavigate } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';
import { styled } from 'styled-components';
import { Tooltip } from '../Tooltip';

interface Props extends CommonProps {
  to?: string;
  setVisible?: (value: boolean) => any;
  icon?: ReactElement;
  behavior?: 'tooltipButton';
  tooltipText?: string | null;
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
  const navigate = useNavigate();
  const colors = useColorScheme();

  const { behavior, tooltipText } = props;

  if (props.to && behavior !== 'tooltipButton') {
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

  if (behavior === 'tooltipButton') {
    return (
      <Tooltip
        width="auto"
        placement="bottom"
        message={tooltipText as string}
        withoutArrow
      >
        <div
          onClick={() => {
            props.to && navigate(props.to);
            !props.to && props.onClick?.(event);
          }}
        >
          {props.icon}
        </div>
      </Tooltip>
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

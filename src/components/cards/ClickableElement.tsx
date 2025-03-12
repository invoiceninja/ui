/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';

const ButtonStyled = styled.button`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }: 
`;

const AStyled = styled.a`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }: 
`;

const LinkStyled = styled(Link)`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }: 
`;

interface Props extends CommonProps {
  to?: string;
  href?: string;
  disableNavigation?: boolean;
}

export function ClickableElement(props: Props) {
  const colors = useColorScheme();

  const classes = `block w-full text-left px-4 sm:px-6 block py-4 space-x-3 text-sm ${props.className}`;

  if (props.to) {
    return (
      <LinkStyled
        theme={{ hoverColor: colors.$4, color: colors.$3 }}
        to={props.to}
        style={{ pointerEvents: !props.disableNavigation ? 'all' : 'none' }}
        className={classes}
      >
        {props.children}
      </LinkStyled>
    );
  }

  if (props.href) {
    return (
      <AStyled
        theme={{ hoverColor: colors.$4, color: colors.$3 }}
        target="_blank"
        href={props.href}
        className={classes}
        rel="noreferrer"
      >
        {props.children}
      </AStyled>
    );
  }

  return (
    <ButtonStyled
      theme={{ hoverColor: colors.$4, color: colors.$3 }}
      type="button"
      onClick={props.onClick}
      onChange={props.onChange}
      className={classes}
    >
      {props.children}
    </ButtonStyled>
  );
}

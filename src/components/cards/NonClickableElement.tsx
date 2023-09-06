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
import CommonProps from '$app/common/interfaces/common-props.interface';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';

interface Props extends CommonProps {
  className?: string;
  padding?: 'small' | 'regular';
}

const DivStyled = styled.div`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function NonClickableElement(props: Props) {
  const { padding = 'regular', className, style } = props;
  const colors = useColorScheme();

  return (
    <DivStyled
      style={{ ...style }}
      theme={{ hoverColor: colors.$2, color: colors.$3 }}
      className={classNames(
        `w-full text-left block hover:bg-gray-50 text-sm ${className}`,
        {
          'px-4 sm:px-6 py-4': padding == 'regular',
          'px-4 py-2': padding == 'small',
        }
      )}
    >
      {props.children}
    </DivStyled>
  );
}

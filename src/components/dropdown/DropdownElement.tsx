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
import { useAtomValue } from 'jotai';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { preventLeavingPageAtom } from '$app/common/hooks/useAddPreventNavigationEvents';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  to?: string;
  setVisible?: (value: boolean) => any;
  icon?: ReactElement;
  cypressRef?: string;
  actionKey?: 'switchCompany';
  disablePreventNavigation?: boolean;
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

  const { prevent: preventLeavingPage } = useAtomValue(preventLeavingPageAtom);

  const preventNavigation = usePreventNavigation({
    disablePrevention: props.disablePreventNavigation,
  });

  const { actionKey } = props;

  if (props.to) {
    return (
      <div className="px-1 py-0.5">
        <StyledLink
          theme={{
            color: colors.$3,
            hoverColor: colors.$20,
          }}
          to={props.to}
          className={classNames(
            {
              'flex items-center': props.icon,
            },
            `w-full text-left z-50 block px-2.5 py-1.5 text-[0.8125rem] leading-[1.125rem] text-gray-700 rounded-[0.1875rem] ${props.className}`
          )}
          onClick={(event) => {
            if (preventLeavingPage) {
              event.preventDefault();

              preventNavigation({ url: props.to });
            }
          }}
        >
          {props.icon && (
            <div className="flex shrink-0 items-center [&_svg]:size-4">
              {props.icon}
            </div>
          )}

          <div
            className={classNames({
              'ml-2': props.icon,
            })}
          >
            {props.children}
          </div>
        </StyledLink>
      </div>
    );
  }

  return (
    <div className="px-1 py-0.5">
      <Button
        theme={{
          color: colors.$3,
          hoverColor: colors.$20,
        }}
        type="button"
        onClick={(event) =>
          preventNavigation({
            fn: () => {
              props.onClick?.(event);
              props.setVisible?.(false);
            },
            actionKey,
          })
        }
        ref={props.innerRef}
        className={classNames(
          {
            'flex items-center': props.icon,
          },
          `w-full text-left z-50 block px-2.5 py-1.5 text-[0.8125rem] leading-[1.125rem] rounded-[0.1875rem] ${props.className} `
        )}
        data-cy={props.cypressRef}
      >
        {props.icon && (
          <div className="flex shrink-0 items-center [&_svg]:size-4">
            {props.icon}
          </div>
        )}

        <div
          className={classNames({
            'ml-2': props.icon,
          })}
        >
          {props.children}
        </div>
      </Button>
    </div>
  );
}

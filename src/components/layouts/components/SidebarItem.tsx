/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { NavigationItem } from './DesktopSidebar';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { useThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import classNames from 'classnames';
import { Link } from '$app/components/forms';
import { useState } from 'react';

const Div = styled.div`
  background-color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

const LinkStyled = styled(Link)`
  &:hover {
    background-color: ${({ theme }) => theme.hoverColor};
  }
`;

interface Props {
  item: NavigationItem;
}

export function SidebarItem(props: Props) {
  const { item } = props;

  const colors = useColorScheme();
  const user = useInjectUserChanges();
  const themeColors = useThemeColorScheme();

  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );

  const [areSubOptionsVisible, setAreSubOptionsVisible] =
    useState<boolean>(false);

  if (!item.visible) {
    return <></>;
  }

  return (
    <div
      className={classNames('flex flex-col justify-center', {
        'gap-y-1': item.subOptions && (item.current || areSubOptionsVisible),
      })}
    >
      <Div
        theme={{
          color: item.current
            ? themeColors.$1 || colors.$8
            : themeColors.$3 || 'transparent',
          hoverColor: themeColors.$1 || colors.$8,
        }}
        key={item.name}
        className={classNames(
          'flex items-center justify-between group px-1.5 text-sm font-medium rounded-md w-full',
          {
            'text-white border-l-4 border-transparent': item.current,
            'text-gray-300 border-l-4 border-transparent': !item.current,
          }
        )}
      >
        <div className="flex flex-col items-center justify-between w-full">
          <LinkStyled to={item.href} className="w-full" withoutDefaultStyling>
            <div
              className="flex justify-start items-center my-2 space-x-3 w-full"
              style={{
                color: item.current ? themeColors.$2 : themeColors.$4,
              }}
            >
              <item.icon
                size="1.275rem"
                color={
                  item.current
                    ? themeColors.$2 || 'white'
                    : themeColors.$4 || '#74747C'
                }
              />

              {!isMiniSidebar && <span>{item.name}</span>}
            </div>
          </LinkStyled>
        </div>

        {item.rightButton && !isMiniSidebar && item.rightButton.visible && (
          <LinkStyled
            theme={{
              hoverColor: colors.$6,
            }}
            to={item.rightButton.to}
            className="rounded-sm p-[0.1rem]"
            withoutDefaultStyling
          >
            <item.rightButton.icon
              size="1.1rem"
              color={
                item.current
                  ? themeColors.$2 || 'white'
                  : themeColors.$4 || '#d1d5db'
              }
            />
          </LinkStyled>
        )}
      </Div>

      {item.current && (
        <div className="flex flex-col justify-center w-full pl-2">
          {item.subOptions && (
            <div className="flex flex-col">
              {item.subOptions.map((subOption) => (
                <Div
                  theme={{
                    color: subOption.current
                      ? themeColors.$1 || colors.$8
                      : themeColors.$3 || 'transparent',
                    hoverColor: themeColors.$1 || colors.$8,
                  }}
                  key={item.name}
                  className={classNames(
                    'flex items-center justify-between group px-1.5 text-sm font-medium rounded-md w-full',
                    {
                      'text-white border-l-4 border-transparent':
                        subOption.current,
                      'text-gray-300 border-l-4 border-transparent':
                        !subOption.current,
                    }
                  )}
                >
                  <div className="flex flex-col items-center justify-between w-full">
                    <LinkStyled
                      to={subOption.href}
                      className="w-full"
                      withoutDefaultStyling
                    >
                      <div
                        className="flex justify-start items-center my-2 space-x-3 w-full"
                        style={{
                          color: subOption.current
                            ? themeColors.$2
                            : themeColors.$4,
                        }}
                      >
                        <subOption.icon
                          size="1.275rem"
                          color={
                            subOption.current
                              ? themeColors.$2 || 'white'
                              : themeColors.$4 || '#74747C'
                          }
                        />

                        {!isMiniSidebar && <span>{subOption.name}</span>}
                      </div>
                    </LinkStyled>
                  </div>

                  {subOption.rightButton &&
                    !isMiniSidebar &&
                    subOption.rightButton.visible && (
                      <LinkStyled
                        theme={{
                          hoverColor: colors.$6,
                        }}
                        to={subOption.rightButton.to}
                        className="rounded-sm p-[0.1rem]"
                        withoutDefaultStyling
                      >
                        <subOption.rightButton.icon
                          size="1.1rem"
                          color={
                            subOption.current
                              ? themeColors.$2 || 'white'
                              : themeColors.$4 || '#d1d5db'
                          }
                        />
                      </LinkStyled>
                    )}
                </Div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

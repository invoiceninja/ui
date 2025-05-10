/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import classNames from 'classnames';
import { MouseEvent, ReactNode, useEffect, useRef } from 'react';
import {
  Link,
  Params,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { SelectField } from './forms';

interface Props {
  className?: string;
  tabs: Tab[];
  disableBackupNavigation?: boolean;
  visible?: boolean;
  rightSide?: ReactNode;
  tabBarClassName?: string;
  withoutDefaultTabSpace?: boolean;
  withHorizontalPadding?: boolean;
  horizontalPaddingWidth?: string;
  fullRightPadding?: boolean;
  withHorizontalPaddingOnSmallScreen?: boolean;
}

export type Tab = {
  name: string;
  href: string;
  matcher?: Matcher[];
  enabled?: boolean;
  formatName?: () => ReactNode | undefined;
};
export type Matcher = (params: Readonly<Params<string>>) => string;

const StyledLink = styled(Link)`
  border-color: ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.textColor};

  &:hover {
    color: ${({ theme }) => theme.hoverTextColor};
  }
`;

export function Tabs(props: Props) {
  const navigate = useNavigate();

  const {
    visible = true,
    tabBarClassName,
    withHorizontalPadding,
    horizontalPaddingWidth = '1.5rem',
    fullRightPadding,
  } = props;

  const params = useParams();
  const location = useLocation();
  const colors = useColorScheme();
  const [searchParams] = useSearchParams();
  const tabBar = useRef<HTMLDivElement>(null);

  const isActive = (tab: Tab) => {
    return (
      location.pathname === tab.href ||
      tab.matcher?.some(
        (matcher) => matcher(params) === route(location.pathname, params)
      )
    );
  };

  const handleScroll = (event: MouseEvent<HTMLAnchorElement>) => {
    const clickedTab = event.currentTarget;

    const tabBarElement = tabBar.current;

    const scrollWidth = tabBarElement!.scrollWidth / 6;

    const scrollBy = clickedTab.getBoundingClientRect().width / 2;

    tabBarElement!.scrollTo({
      left: clickedTab!.offsetLeft - scrollWidth - scrollBy,
    });
  };

  useEffect(() => {
    if (props.tabs.length && !props.disableBackupNavigation) {
      const doesDefaultUrlExist = props.tabs.some(
        ({ href }) => href === location.pathname
      );

      if (searchParams.get('redirect') === 'false') {
        return;
      }

      if (!doesDefaultUrlExist) {
        navigate(props.tabs[0].href);
      }
    }
  }, []);

  return visible ? (
    <div className={props.className} data-cy="tabs">
      <div
        className={classNames('flex flex-col space-y-5 sm:hidden', {
          'px-4': props.withHorizontalPaddingOnSmallScreen,
        })}
      >
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>

        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <SelectField
          id="tabs"
          className="text-sm sm:text-sm"
          defaultValue={props.tabs.find((tab) => tab)?.name}
          onValueChange={(value) => navigate(value)}
          customSelector
        >
          {props.tabs.map(
            (tab) =>
              (typeof tab.enabled === 'undefined' || tab.enabled) && (
                <option key={tab.name} value={tab.href}>
                  {tab.formatName?.() || tab.name}
                </option>
              )
          )}
        </SelectField>

        {props.rightSide}
      </div>

      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          <nav
            ref={tabBar}
            className={classNames(
              'flex flex-1 relative scroll-smooth overflow-x-auto',
              tabBarClassName
            )}
            aria-label="Tabs"
          >
            {withHorizontalPadding && (
              <div
                style={{
                  width: horizontalPaddingWidth,
                  height: '2.8rem',
                  borderBottom: `1px solid ${colors.$20}`,
                }}
              />
            )}

            {props.tabs.map(
              (tab) =>
                (typeof tab.enabled === 'undefined' || tab.enabled) && (
                  <StyledLink
                    key={tab.name}
                    to={tab.href}
                    onClick={(event) => handleScroll(event)}
                    theme={{
                      textColor: isActive(tab) ? colors.$3 : colors.$17,
                      hoverTextColor: colors.$3,
                    }}
                    className="whitespace-nowrap font-medium text-sm px-4 py-3"
                    aria-current={isActive(tab) ? 'page' : undefined}
                    style={{
                      borderBottom: isActive(tab)
                        ? `1px solid ${colors.$3}`
                        : `1px solid ${colors.$20}`,
                    }}
                  >
                    <div>{tab.formatName?.() || tab.name}</div>
                  </StyledLink>
                )
            )}

            <div
              className={classNames({
                'flex-1': !withHorizontalPadding || fullRightPadding,
              })}
              style={{
                ...(Boolean(withHorizontalPadding && !fullRightPadding) && {
                  width: horizontalPaddingWidth,
                }),
                height: '2.8rem',
                borderBottom: `1px solid ${colors.$20}`,
              }}
            />
          </nav>

          {props.rightSide && (
            <div
              className="border-b pl-4"
              style={{ borderColor: colors.$20, height: '2.8rem' }}
            >
              {props.rightSide}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

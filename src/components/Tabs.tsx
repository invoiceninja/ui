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
import { useAccentColor } from '$app/common/hooks/useAccentColor';
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

interface Props {
  className?: string;
  tabs: Tab[];
  disableBackupNavigation?: boolean;
  visible?: boolean;
  rightSide?: ReactNode;
  tabBarClassName?: string;
  withoutDefaultTabSpace?: boolean;
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

  const { visible = true, withoutDefaultTabSpace, tabBarClassName } = props;

  const params = useParams();
  const location = useLocation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();
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
      <div className="flex flex-col space-y-5 sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>

        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          defaultValue={props.tabs.find((tab) => tab)?.name}
          onChange={(e) => navigate(e.currentTarget.value)}
        >
          {props.tabs.map(
            (tab) =>
              (typeof tab.enabled === 'undefined' || tab.enabled) && (
                <option key={tab.name} value={tab.href}>
                  {tab.formatName?.() || tab.name}
                </option>
              )
          )}
        </select>

        {props.rightSide}
      </div>

      <div className="hidden sm:block">
        <div
          className="flex items-center justify-between space-x-4"
          style={{ borderBottom: `2px solid ${colors.$20}` }}
        >
          <nav
            ref={tabBar}
            className={classNames(
              'flex relative scroll-smooth overflow-x-auto',
              tabBarClassName
            )}
            aria-label="Tabs"
            style={{ marginBottom: '-2px' }}
          >
            {props.tabs.map(
              (tab) =>
                (typeof tab.enabled === 'undefined' || tab.enabled) && (
                  <div className="relative p-4">
                    <StyledLink
                      key={tab.name}
                      to={tab.href}
                      onClick={(event) => handleScroll(event)}
                      theme={{
                        textColor: isActive(tab) ? colors.$3 : colors.$17,
                        hoverTextColor: colors.$3,
                      }}
                      className="whitespace-nowrap font-medium text-sm"
                      aria-current={isActive(tab) ? 'page' : undefined}
                    >
                      <div>{tab.formatName?.() || tab.name}</div>
                    </StyledLink>

                    {isActive(tab) && (
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2 w-full"
                        style={{
                          height: '2px',
                          backgroundColor: colors.$3,
                          bottom: 0,
                        }}
                      />
                    )}
                  </div>
                )
            )}
          </nav>

          {props.rightSide}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

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
import { MouseEvent, ReactNode, useEffect, useRef } from 'react';
import {
  Link,
  Params,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

interface Props {
  className?: string;
  tabs: Tab[];
  disableBackupNavigation?: boolean;
  visible?: boolean;
  rightSide?: ReactNode;
}

export type Tab = {
  name: string;
  href: string;
  matcher?: Matcher[];
  enabled?: boolean;
  formatName?: () => ReactNode | undefined;
};
export type Matcher = (params: Readonly<Params<string>>) => string;

export function Tabs(props: Props) {
  const navigate = useNavigate();

  const { visible = true } = props;

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
        >
          {props.tabs.map(
            (tab) =>
              (typeof tab.enabled === 'undefined' || tab.enabled) && (
                <option key={tab.name}>{tab.formatName?.() || tab.name}</option>
              )
          )}
        </select>

        {props.rightSide}
      </div>

      <div className="hidden sm:block">
        <div
          className="flex justify-between border-b"
          style={{ borderColor: colors.$5 }}
        >
          <nav
            ref={tabBar}
            className="-mb-px flex space-x-8 relative scroll-smooth overflow-x-auto"
            aria-label="Tabs"
          >
            {props.tabs.map(
              (tab) =>
                (typeof tab.enabled === 'undefined' || tab.enabled) && (
                  <Link
                    key={tab.name}
                    to={tab.href}
                    onClick={(event) => handleScroll(event)}
                    style={{
                      borderColor: isActive(tab) ? accentColor : 'transparent',
                      color: isActive(tab) ? accentColor : colors.$3,
                    }}
                    className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    aria-current={isActive(tab) ? 'page' : undefined}
                  >
                    {tab.formatName?.() || tab.name}
                  </Link>
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

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useLogo } from '$app/common/hooks/useLogo';
import { useSidebarBackgroundColor } from '$app/common/hooks/useSidebarBackgroundColor';
import { RootState } from '$app/common/stores/store';
import { CompanySwitcher } from '$app/components/CompanySwitcher';
import { HelpSidebarIcons } from '$app/components/HelpSidebarIcons';
import { Icon } from 'react-feather';
import { useSelector } from 'react-redux';
import { SidebarItem } from './SidebarItem';
import colors from '$app/common/constants/colors';
import classNames from 'classnames';

export interface NavigationItem {
  name: string;
  href: string;
  icon: Icon;
  current: boolean;
  visible: boolean;
  rightButton?: {
    icon: Icon;
    to: string;
    label: string;
    visible: boolean;
  };
}

interface Props {
  navigation: NavigationItem[];
  docsLink?: string;
}

export function DesktopSidebar(props: Props) {
  const isMiniSidebar = useSelector(
    (state: RootState) => state.settings.isMiniSidebar
  );

  const logo = useLogo();

  const sideBarColor = useSidebarBackgroundColor();

  return (
    <div
      className={`hidden md:flex z-10 ${
        isMiniSidebar ? 'md:w-16' : 'md:w-64'
      } md:flex-col md:fixed md:inset-y-0`}
    >
      <div
        className={classNames(
          'flex flex-col flex-grow border-gray-100 overflow-y-auto border-r',
          {
            'dark:bg-gray-800 dark:border-transparent':
              colors.ninjaGray === sideBarColor,
          }
        )}
        style={{ backgroundColor: sideBarColor }}
      >
        <div className="flex items-center flex-shrink-0 px-4 bg-white h-16">
          {isMiniSidebar ? (
            <img className="w-8" src={logo} alt="Company logo" />
          ) : (
            <CompanySwitcher />
          )}
        </div>

        <div className="flex-grow flex flex-col">
          <nav className="flex-1 pb-4 space-y-1">
            {props.navigation.map((item, index) => (
              <SidebarItem key={index} item={item} />
            ))}
          </nav>

          <HelpSidebarIcons docsLink={props.docsLink} />
        </div>
      </div>
    </div>
  );
}

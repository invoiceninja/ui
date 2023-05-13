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
import { RootState } from '$app/common/stores/store';
import { CompanySwitcher } from '$app/components/CompanySwitcher';
import { HelpSidebarIcons } from '$app/components/HelpSidebarIcons';
import { Icon } from 'react-feather';
import { useSelector } from 'react-redux';
import { SidebarItem } from './SidebarItem';

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

  return (
    <div
      className={`hidden md:flex z-10 ${
        isMiniSidebar ? 'md:w-16' : 'md:w-64'
      } md:flex-col md:fixed md:inset-y-0`}
    >
      <div className="flex flex-col flex-grow border-gray-100 bg-ninja-gray overflow-y-auto border-r">
        <div className="flex items-center flex-shrink-0 pl-3 pr-6 bg-ninja-gray h-16 border border-x-0 border-t-0 border-b-gray-600">
          {isMiniSidebar ? (
            <img className="h-9" src={logo} alt="Company logo" />
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

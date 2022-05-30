/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useLogo } from 'common/hooks/useLogo';
import { RootState } from 'common/stores/store';
import { CompanySwitcher } from 'components/CompanySwitcher';
import { HelpSidebarIcons } from 'components/HelpSidebarIcons';
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
      className={`hidden md:flex ${
        isMiniSidebar ? 'md:w-16' : 'md:w-64'
      } md:flex-col md:fixed md:inset-y-0`}
      style={{ zIndex: 100 }}
    >
      <div className="flex flex-col flex-grow border-gray-100 bg-ninja-gray dark:bg-gray-800 dark:border-transparent overflow-y-auto border-r">
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

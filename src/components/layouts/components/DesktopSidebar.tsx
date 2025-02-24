/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CompanySwitcher } from '$app/components/CompanySwitcher';
import { HelpSidebarIcons } from '$app/components/HelpSidebarIcons';
import { SidebarItem } from './SidebarItem';
import { useColorScheme } from '$app/common/colors';
import { Tooltip } from '$app/components/Tooltip';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import classNames from 'classnames';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  current: boolean;
  visible: boolean;
  rightButton?: {
    icon: React.ElementType;
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
  const user = useInjectUserChanges();

  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );

  const colors = useColorScheme();

  return (
    <div
      className={classNames(
        'hidden md:flex z-10 md:flex-col md:fixed md:inset-y-0',
        {
          'md:w-16': isMiniSidebar,
          'md:w-64': !isMiniSidebar,
        }
      )}
    >
      <div
        className="flex flex-col flex-grow overflow-y-auto border-r px-3"
        style={{ backgroundColor: colors.$14, borderColor: colors.$4 }}
      >
        <div
          className={classNames(
            'flex items-center flex-shrink-0 h-16 border-b',
            {
              'py-3': !isMiniSidebar,
              'justify-center': isMiniSidebar,
            }
          )}
          style={{
            borderColor: 'white',
            color: colors.$3,
          }}
        >
          <CompanySwitcher />
        </div>

        <div className="flex-grow flex flex-col mt-3">
          <nav className="flex-1 pb-4 space-y-1" data-cy="navigationBar">
            {props.navigation.map((item, index) =>
              isMiniSidebar ? (
                <Tooltip
                  key={index}
                  message={item.name as string}
                  width="auto"
                  placement="right"
                  withoutArrow={true}
                  withoutWrapping
                >
                  <SidebarItem key={index} item={item} />
                </Tooltip>
              ) : (
                <SidebarItem key={index} item={item} />
              )
            )}
          </nav>

          <HelpSidebarIcons docsLink={props.docsLink} />
        </div>
      </div>
    </div>
  );
}

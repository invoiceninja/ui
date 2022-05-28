/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { classNames } from 'common/helpers';
import { RootState } from 'common/stores/store';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { NavigationItem } from './DesktopSidebar';

interface Props {
  item: NavigationItem;
}

export function SidebarItem(props: Props) {
  const { item } = props;

  const isMiniSidebar = useSelector(
    (state: RootState) => state.settings.isMiniSidebar
  );

  return (
    <div
      key={item.name}
      className={classNames(
        'flex items-center justify-between group px-4 text-sm font-medium',
        item.current
          ? 'text-white border-l-4 border-transparent bg-ninja-gray-darker dark:bg-gray-700'
          : 'text-gray-300 hover:text-white border-l-4 border-transparent hover:bg-ninja-gray-darker dark:hover:bg-gray-700'
      )}
    >
      <Link to={item.href} className="w-full">
        <div className="flex justify-start items-center my-2">
          <item.icon
            className={classNames(
              'mr-3 flex-shrink-0 h-6 w-6',
              item.current
                ? 'text-white'
                : 'text-gray-300 group-hover:text-white'
            )}
            aria-hidden="true"
          />
          {!isMiniSidebar && item.name}
        </div>
      </Link>

      {item.rightButton && !isMiniSidebar && (
        <Link
          to={item.rightButton.to}
          title={item.rightButton.label}
          className="hover:bg-gray-200 hover:bg-opacity-10 rounded-full p-1.5"
        >
          <item.rightButton.icon />
        </Link>
      )}
    </div>
  );
}

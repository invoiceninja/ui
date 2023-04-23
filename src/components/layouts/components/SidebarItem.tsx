/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSidebarBackgroundColor } from '$app/common/hooks/useSidebarBackgroundColor';
import { RootState } from '$app/common/stores/store';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { NavigationItem } from './DesktopSidebar';
import colors from '$app/common/constants/colors';
import classNames from 'classnames';
import { useState } from 'react';
import { useAdjustColorDarkness } from '$app/common/hooks/useAdjustColorDarkness';

interface Props {
  item: NavigationItem;
}

export function SidebarItem(props: Props) {
  const { item } = props;

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const sideBarColor = useSidebarBackgroundColor();

  const isMiniSidebar = useSelector(
    (state: RootState) => state.settings.isMiniSidebar
  );

  const adjustColorDarkness = useAdjustColorDarkness();

  const getItemBackgroundColor = (isCurrent: boolean) => {
    if (colors.ninjaGray !== sideBarColor) {
      if (isCurrent || isHovered) {
        return adjustColorDarkness(sideBarColor, -40);
      }

      return 'transparent';
    }
  };

  if (!item.visible) {
    return <></>;
  }

  return (
    <div
      key={item.name}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={classNames(
        'flex items-center justify-between group px-4 text-sm font-medium',
        {
          'bg-ninja-gray-darker dark:bg-gray-700':
            item.current && colors.ninjaGray === sideBarColor,
          'hover:bg-ninja-gray-darker dark:hover:bg-gray-700':
            !item.current && colors.ninjaGray === sideBarColor,
          'text-white border-l-4 border-transparent': item.current,
          'text-gray-300 hover:text-white border-l-4 border-transparent':
            !item.current,
        }
      )}
      style={{
        backgroundColor: getItemBackgroundColor(item.current),
      }}
    >
      <Link to={item.href} className="w-full">
        <div className="flex justify-start items-center my-2">
          <item.icon
            className={classNames('mr-3 flex-shrink-0 h-6 w-6', {
              'text-white': item.current,
              'text-gray-300 group-hover:text-white': !item.current,
            })}
            aria-hidden="true"
          />
          {!isMiniSidebar && item.name}
        </div>
      </Link>

      {item.rightButton && !isMiniSidebar && item.rightButton.visible && (
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

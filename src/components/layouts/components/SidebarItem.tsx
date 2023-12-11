/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { classNames } from '$app/common/helpers';
import { Link } from 'react-router-dom';
import { NavigationItem } from './DesktopSidebar';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';

const Div = styled.div`
  background-color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

interface Props {
  item: NavigationItem;
  colors: ReturnType<typeof useColorScheme>;
}

export function SidebarItem(props: Props) {
  const { item, colors } = props;

  const user = useInjectUserChanges();

  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );

  if (!item.visible) {
    return <></>;
  }

  return (
    <Div
      theme={{
        color: item.current ? colors.$8 : 'transparent',
        hoverColor: colors.$8,
      }}
      key={item.name}
      className={classNames(
        'flex items-center justify-between group px-4 text-sm font-medium',
        item.current
          ? 'text-white border-l-4 border-transparent'
          : 'text-gray-300 border-l-4 border-transparent'
      )}
    >
      <Link to={item.href} className="w-full">
        <div className="flex justify-start items-center my-2">
          <item.icon
            className={classNames(
              'mr-3 flex-shrink-0 h-5 w-5',
              item.current
                ? 'text-white'
                : 'text-gray-300 group-hover:text-white'
            )}
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
          <item.rightButton.icon className="h-5 w-5" />
        </Link>
      )}
    </Div>

  );
}

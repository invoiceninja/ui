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
import { NavigationItem } from './DesktopSidebar';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { Link } from '$app/components/forms';

const Div = styled.div`
  background-color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

const LinkStyled = styled(Link)`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
    background-opacity: ${(props) => props.theme.hoverOpacity};
  }: 
`;

interface Props {
  item: NavigationItem;
}

export function SidebarItem(props: Props) {
  const { item } = props;

  const colors = useColorScheme();

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
      <LinkStyled
        to={item.href}
        className="w-full"
        withoutDefaultStyling
        withoutUnderlineStyling
      >
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
      </LinkStyled>

      {item.rightButton && !isMiniSidebar && item.rightButton.visible && (
        <LinkStyled
          theme={{
            hoverColor: colors.$13,
            hoverOpacity: 0.1,
          }}
          to={item.rightButton.to}
          className="rounded-full p-1.5"
          withoutDefaultStyling
          withoutUnderlineStyling
        >
          <item.rightButton.icon className="h-5 w-5" />
        </LinkStyled>
      )}
    </Div>
  );
}

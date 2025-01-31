/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { NavigationItem } from './DesktopSidebar';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { useThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import classNames from 'classnames';
import { Link } from '$app/components/forms';
import { hexToRGB } from '$app/common/hooks/useAdjustColorDarkness';

const Div = styled.div`
  background-color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

const LinkStyled = styled(Link)`
  &:hover {
    background-color: ${(props) => {
      if (props.theme.hoverColor) {
        const rgbColor = hexToRGB(props.theme.hoverColor);
        return `rgba(${rgbColor.red}, ${rgbColor.green}, ${rgbColor.blue}, 0.1)`;
      }

      return props.theme.hoverColor;
    }};
  }
`;

interface Props {
  item: NavigationItem;
}

export function SidebarItem(props: Props) {
  const { item } = props;

  const colors = useColorScheme();

  const user = useInjectUserChanges();

  const themeColors = useThemeColorScheme();

  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );

  if (!item.visible) {
    return <></>;
  }

  return (
    <Div
      theme={{
        color: item.current
          ? themeColors.$1 || colors.$8
          : themeColors.$3 || 'transparent',
        hoverColor: themeColors.$1 || colors.$8,
      }}
      key={item.name}
      className={classNames(
        'flex items-center justify-between group px-1.5 text-sm font-medium rounded-md',
        {
          'text-white border-l-4 border-transparent': item.current,
          'text-gray-300 border-l-4 border-transparent': !item.current,
        }
      )}
    >
      <LinkStyled to={item.href} className="w-full" withoutDefaultStyling>
        <div
          className="flex justify-start items-center my-2"
          style={{
            color: item.current ? themeColors.$2 : themeColors.$4,
          }}
        >
          <item.icon
            className={classNames('mr-3 flex-shrink-0 h-5 w-5', {
              'text-white': item.current,
              'text-gray-300 group-hover:text-white': !item.current,
            })}
            aria-hidden="true"
            style={{
              color: item.current ? themeColors.$2 : themeColors.$4,
            }}
          />
          {!isMiniSidebar && item.name}
        </div>
      </LinkStyled>

      {item.rightButton && !isMiniSidebar && item.rightButton.visible && (
        <LinkStyled
          theme={{
            hoverColor: colors.$13,
          }}
          to={item.rightButton.to}
          className="rounded-full p-1.5"
          withoutDefaultStyling
        >
          <item.rightButton.icon
            className="h-5 w-5"
            style={{
              color: item.current ? themeColors.$2 : themeColors.$4,
            }}
          />
        </LinkStyled>
      )}
    </Div>
  );
}

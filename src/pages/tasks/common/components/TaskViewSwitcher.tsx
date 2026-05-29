/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { useColorScheme } from '$app/common/colors';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  BsCalendarDay,
  BsCalendarMonth,
  BsCalendarWeek,
  BsKanban,
  BsListUl,
} from 'react-icons/bs';
import classNames from 'classnames';

// Query params we should carry between task views so the chosen user filter
// survives a switch from e.g. Daily to Weekly.
const PRESERVED_PARAMS = ['user'];

interface ViewItem {
  to: string;
  label: string;
  icon: JSX.Element;
}

export function TaskViewSwitcher() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const carriedParams = new URLSearchParams();
  PRESERVED_PARAMS.forEach((key) => {
    const value = searchParams.get(key);
    if (value) carriedParams.set(key, value);
  });
  const carriedSuffix = carriedParams.toString();

  const items: ViewItem[] = [
    { to: '/tasks', label: t('list'), icon: <BsListUl size={16} /> },
    {
      to: '/tasks/daily',
      label: t('daily'),
      icon: <BsCalendarDay size={16} />,
    },
    {
      to: '/tasks/weekly',
      label: t('weekly'),
      icon: <BsCalendarWeek size={16} />,
    },
    {
      to: '/tasks/calendar',
      label: t('monthly'),
      icon: <BsCalendarMonth size={16} />,
    },
    { to: '/tasks/kanban', label: t('kanban'), icon: <BsKanban size={16} /> },
  ];

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-md border"
      style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
    >
      {items.map((item) => {
        const active =
          item.to === '/tasks'
            ? location.pathname === '/tasks'
            : location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={carriedSuffix ? `${item.to}?${carriedSuffix}` : item.to}
            withoutDefaultStyling
          >
            <span
              className={classNames(
                'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium'
              )}
              style={{
                backgroundColor: active ? colors.$2 : 'transparent',
                color: active ? colors.$3 : colors.$17,
              }}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

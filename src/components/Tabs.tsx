/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from 'common/hooks/useAccentColor';

interface Props {
  className?: string;
  tabs: Tab[];
}

export type Tab = { name: string; href: string };

export function Tabs(props: Props) {
  const accentColor = useAccentColor();

  const isActive = (link: string) => {
    return location.pathname.endsWith(link);
  };

  return (
    <div className={props.className}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>

        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          defaultValue={props.tabs.find((tab) => tab)?.name}
        >
          {props.tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {props.tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                style={{
                  borderColor: isActive(tab.href) ? accentColor : 'transparent',
                  color: isActive(tab.href) ? accentColor : '#6B7280',
                }}
                className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                aria-current={isActive(tab.href) ? 'page' : undefined}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from 'common/hooks/useAccentColor';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  className?: string;
  tabs: Tab[];
  tabsActivity: PaymentTabsActivity;
  setTabsActivity: Dispatch<SetStateAction<PaymentTabsActivity>>;
  activeTabKey: string;
}

export interface Tab {
  name: string;
}

export interface PaymentTabsActivity {
  overview: boolean;
  credentials: boolean;
  settings: boolean;
  required_fields: boolean;
  limits_and_fees: boolean;
}

export function Tabs(props: Props) {
  const [t] = useTranslation();

  const accentColor = useAccentColor();

  const handleChangeTab = (property: string) => {
    props.setTabsActivity((prevState) => ({
      ...prevState,
      [props.activeTabKey]: false,
      [property]: true,
    }));
  };

  return (
    <div className={props.className}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={props.activeTabKey}
          onChange={(event) => handleChangeTab(event.target.value)}
        >
          {props.tabs.map((tab) => (
            <option key={tab.name} value={tab.name}>
              {t(tab.name)}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav
            className="-mb-px flex space-x-8 relative scroll-smooth overflow-x-auto"
            aria-label="Tabs"
          >
            {props.tabs.map((tab) => (
              <div
                key={tab.name}
                onClick={() => handleChangeTab(tab.name)}
                style={{
                  borderColor: props.tabsActivity[
                    tab.name as keyof typeof props.tabsActivity
                  ]
                    ? accentColor
                    : 'transparent',
                  color: props.tabsActivity[
                    tab.name as keyof typeof props.tabsActivity
                  ]
                    ? accentColor
                    : '#6B7280',
                }}
                className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer"
              >
                {t(tab.name)}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

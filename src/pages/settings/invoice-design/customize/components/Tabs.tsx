/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Tabs() {
  const [t] = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('settings');

  const tabs = [
    { value: 'settings', label: t('settings') },
    { value: 'body', label: t('body') },
    { value: 'header', label: t('header') },
    { value: 'footer', label: t('footer') },
    { value: 'products', label: t('products') },
    { value: 'includes', label: t('includes') },
  ];

  return (
    <nav
      className="flex space-x-4 overflow-y-auto pb-2 lg:pb-0"
      aria-label="Tabs"
    >
      {tabs.map((tab, index) => {
        return (
          <button
            key={index}
            onClick={() => setActiveTab(tab.value)}
            className={classNames(
              'hover:bg-gray-200 text-gray-700 px-3 py-2 font-medium text-sm rounded',
              {
                'bg-gray-200': tab.value === activeTab,
              }
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

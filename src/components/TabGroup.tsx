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
import React, { ReactElement, useState } from 'react';

export interface Tab {
  tab: string;
  index: number;
}

interface Props {
  children: ReactElement[];
  tabs: string[];
  className?: string;
  defaultTabIndex?: number;
  onTabClick?: (tab: Tab) => unknown;
  isTransactionMatchingTabGroup?: boolean;
}

export function TabGroup(props: Props) {
  const accentColor = useAccentColor();

  const [currentIndex, setCurrentIndex] = useState(props.defaultTabIndex || 0);

  const handleTabClick = (tab: Tab) => {
    setCurrentIndex(tab.index);

    if (props.onTabClick) {
      props.onTabClick(tab);
    }
  };

  return (
    <div className={props.className}>
      <div
        className={`-mb-px flex space-x-8 overflow-x-auto border-b border-gray-200 ${
          props.isTransactionMatchingTabGroup && 'justify-center'
        }`}
      >
        {props.tabs.map((tab, index) => (
          <div key={index}>
            <button
              type="button"
              onClick={() => handleTabClick({ tab, index })}
              style={{
                borderColor:
                  currentIndex === index ? accentColor : 'transparent',
                color: currentIndex === index ? accentColor : '#6B7280',
              }}
              className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              {tab}
            </button>
          </div>
        ))}
      </div>

      <div
        className={`${
          props.isTransactionMatchingTabGroup && 'flex flex-1'
        } my-4`}
      >
        {[...props.children].map(
          (element, index) =>
            React.isValidElement(element) &&
            React.cloneElement(element, {
              key: index,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              style: {
                display:
                  currentIndex === index
                    ? `${
                        props.isTransactionMatchingTabGroup ? 'flex' : 'block'
                      }`
                    : 'none',
                ...(props.isTransactionMatchingTabGroup && {
                  flexDirection: 'column',
                }),
                ...(props.isTransactionMatchingTabGroup && {
                  flexGrow: 1,
                }),
              },
            })
        )}
      </div>
    </div>
  );
}

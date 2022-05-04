/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '@headlessui/react';
import { useAccentColor } from 'common/hooks/useAccentColor';
import React, { Fragment, ReactElement } from 'react';

interface Props {
  children: ReactElement[];
  tabs: string[];
  className?: string;
}

export function TabGroup(props: Props) {
  const accentColor = useAccentColor();

  return (
    <Tab.Group>
      <div className={`border-b border-gray-200 ${props.className}`}>
        <Tab.List className="-mb-px flex space-x-8 overflow-x-auto">
          {props.tabs.map((tab, index) => (
            <Tab as={Fragment} key={index}>
              {({ selected }) => (
                <button
                  style={{
                    borderColor: selected ? accentColor : 'transparent',
                    color: selected ? accentColor : '#6B7280',
                  }}
                  className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                  {tab}
                </button>
              )}
            </Tab>
          ))}
        </Tab.List>
      </div>
      <Tab.Panels className="my-4">
        {props.children.map((child: ReactElement, key) =>
          React.cloneElement(child, { key })
        )}
      </Tab.Panels>
    </Tab.Group>
  );
}

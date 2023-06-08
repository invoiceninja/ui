/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import React, { ReactElement, useState } from 'react';

interface Props {
  children: ReactElement[];
  tabs: string[];
  className?: string;
  defaultTabIndex?: number;
  height?: 'full';
  width?: 'full';
  childrenClassName?: string;
  withScrollableContent?: boolean;
  onTabChange?: (index: number) => void;
}

export function TabGroup(props: Props) {
  const accentColor = useAccentColor();

  const [currentIndex, setCurrentIndex] = useState(props.defaultTabIndex || 0);

  const handleTabChange = (index: number) => {
    setCurrentIndex(index);

    props.onTabChange?.(index);
  };

  return (
    <div className={props.className}>
      <div className="-mb-px flex space-x-8 overflow-x-auto border-b border-gray-200">
        {props.tabs.map((tab, index) => (
          <div
            key={index}
            className={classNames({ 'w-full': props.width === 'full' })}
          >
            <button
              type="button"
              onClick={() => handleTabChange(index)}
              style={{
                borderColor:
                  currentIndex === index ? accentColor : 'transparent',
                color: currentIndex === index ? accentColor : '#6B7280',
              }}
              className={classNames(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                { 'w-full': props.width === 'full' }
              )}
            >
              {tab}
            </button>
          </div>
        ))}
      </div>

      <div
        className={classNames(props.childrenClassName, {
          'flex flex-1': props.height === 'full',
          'my-4': props.height !== 'full',
          'overflow-y-scroll px-[5px]': props.withScrollableContent,
        })}
      >
        {[...props.children].map(
          (element, index) =>
            React.isValidElement(element) &&
            React.cloneElement(element, {
              key: index,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              className: classNames(element.props?.className, {
                'flex flex-col flex-1': props.height === 'full',
                'block my-4': props.height !== 'full',
                hidden: currentIndex !== index,
              }),
            })
        )}
      </div>
    </div>
  );
}

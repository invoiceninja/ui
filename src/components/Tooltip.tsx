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
import { ReactElement, useEffect, useRef, useState } from 'react';

interface Props {
  children: ReactElement;
  message: string;
  className?: string;
  truncate?: boolean;
  size?: 'small' | 'regular' | 'large';
}

export function Tooltip(props: Props) {
  const parentChildrenElement = useRef<HTMLDivElement>(null);

  const [messageWidth, setMessageWidth] = useState<number>(0);

  const [includeLeading, setIncludeLeading] = useState<boolean>(false);

  useEffect(() => {
    const parentChildrenElementWidth =
      parentChildrenElement?.current?.offsetWidth;

    const hoverElement = parentChildrenElement?.current
      ?.children[0] as HTMLElement;

    if (hoverElement && parentChildrenElementWidth) {
      if (hoverElement.offsetWidth > parentChildrenElementWidth) {
        setMessageWidth(parentChildrenElementWidth + 10);
        setIncludeLeading(true);
      } else {
        setMessageWidth(hoverElement.offsetWidth + 10);
      }
    }
  }, [parentChildrenElement, props.message]);

  return (
    <div
      className={classNames(`group ${props.className}`, {
        'max-w-sm': props.size === undefined || props.size === 'small',
        'max-w-md': props.size === 'regular',
        'max-w-xl': props.size === 'large',
      })}
    >
      <div
        ref={parentChildrenElement}
        className={classNames('cursor-pointer', {
          'truncate w-full': props.truncate,
        })}
      >
        {props.children}
      </div>

      <div className="flex absolute z-50">
        <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
          <span
            className={classNames(
              'relative p-2 text-xs text-center text-white rounded-md bg-gray-500 whitespace-normal',
              {
                'leading-1': includeLeading,
                'leading-none': !includeLeading,
              }
            )}
            style={{ width: messageWidth }}
          >
            {props.message}
          </span>

          <div className="w-3 h-3 -mt-2 rotate-45 opacity-90 bg-gray-500"></div>
        </div>
      </div>
    </div>
  );
}

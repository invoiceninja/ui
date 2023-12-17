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
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import Tippy from '@tippyjs/react/headless';
import { useColorScheme } from '$app/common/colors';

interface Props {
  children: ReactElement;
  message?: string;
  className?: string;
  truncate?: boolean;
  size?: 'small' | 'regular' | 'large';
  width?: number | string;
  placement?: 'top' | 'bottom' | 'right';
  containsUnsafeHTMLTags?: boolean;
  withoutArrow?: boolean;
  tooltipElement?: ReactNode;
  disabled?: boolean;
  withoutWrapping?: boolean;
}

export function Tooltip(props: Props) {
  const colors = useColorScheme();

  const {
    width,
    placement,
    withoutArrow,
    tooltipElement,
    message,
    disabled,
    withoutWrapping,
  } = props;

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
      className={classNames(props.className, {
        'max-w-sm': props.size === undefined || props.size === 'small',
        'max-w-md': props.size === 'regular',
        'max-w-xl': props.size === 'large',
      })}
    >
      <Tippy
        placement={placement || 'top-start'}
        interactive={true}
        render={() => (
          <div className="flex flex-col items-center">
            <div
              className={classNames(
                'relative p-2 text-xs text-center text-white rounded-md',
                {
                  'leading-1': includeLeading,
                  'leading-none': !includeLeading,
                  'whitespace-normal break-all':
                    Boolean(message) && !withoutWrapping,
                  'whitespace-nowrap': withoutWrapping,
                }
              )}
              style={{
                width: width || messageWidth,
                backgroundColor: colors.$5,
                color: colors.$3,
              }}
            >
              {message && (
                <>
                  {props.containsUnsafeHTMLTags ? (
                    <span dangerouslySetInnerHTML={{ __html: message }} />
                  ) : (
                    message
                  )}
                </>
              )}

              {tooltipElement}
            </div>

            {!withoutArrow && (
              <div
                className="w-3 h-3 -mt-2 rotate-45 opacity-90"
                style={{ backgroundColor: colors.$5 }}
              ></div>
            )}
          </div>
        )}
        disabled={disabled}
      >
        <div
          ref={parentChildrenElement}
          className={classNames('cursor-pointer', {
            'truncate w-full': props.truncate,
          })}
        >
          {props.children}
        </div>
      </Tippy>
    </div>
  );
}

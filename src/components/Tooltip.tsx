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
import { Icon } from './icons/Icon';
import { MdPlayArrow } from 'react-icons/md';

interface Props {
  children: ReactElement;
  message?: string;
  className?: string;
  truncate?: boolean;
  size?: 'small' | 'regular' | 'large';
  width?: number | string;
  placement?: 'top' | 'bottom' | 'right';
  withoutArrow?: boolean;
  tooltipElement?: ReactNode;
  disabled?: boolean;
  withoutWrapping?: boolean;
  centerVertically?: boolean;
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
          <div
            className="flex flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
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
                backgroundColor: colors.$3,
                color: colors.$1,
              }}
            >
              {message}

              {tooltipElement}
            </div>

            {!withoutArrow && (
              <Icon
                className="rotate-90"
                element={MdPlayArrow}
                size={24}
                style={{ color: colors.$3, marginTop: '-0.51rem' }}
              />
            )}
          </div>
        )}
        disabled={disabled}
      >
        <div
          ref={parentChildrenElement}
          className={classNames('cursor-pointer', {
            'truncate w-full': props.truncate,
            'flex items-center': props.centerVertically,
          })}
        >
          {props.children}
        </div>
      </Tippy>
    </div>
  );
}

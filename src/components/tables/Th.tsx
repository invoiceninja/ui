/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState, useCallback, ReactNode } from 'react';
import classNames from 'classnames';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { useResizeColumn } from '$app/common/hooks/useResizeColumn';

export interface ColumnSortPayload {
  sort: string;
  field: string;
}

interface Props extends CommonProps {
  onColumnClick?: any;
  isCurrentlyUsed?: boolean;
  childrenClassName?: string;
  textColor?: string;
  disableUppercase?: boolean;
  resizable?: string;
  withoutVerticalPadding?: boolean;
  useOnlyCurrentSortDirectionIcon?: boolean;
  textSize?: 'extraSmall' | 'small';
  descIcon?: ReactNode;
  ascIcon?: ReactNode;
}

const defaultProps: Props = {
  isCurrentlyUsed: false,
};

export function Th$(props: Props) {
  props = { ...defaultProps, ...props };

  const {
    thRef,
    currentWidth,
    handleMouseDown,
    handleDoubleClick,
    handleMouseMove,
    isResizing,
  } = useResizeColumn(props.resizable);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleClick = useCallback(() => {
    if (props.onColumnClick) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
      props.onColumnClick({
        sort: `${props.id}|${order}`,
        field: props.id,
      });
    }
  }, [order, props.onColumnClick, props.id]);

  const colors = useColorScheme();

  return (
    <th
      ref={thRef}
      style={{
        color: props.textColor || colors.$9,
        borderColor: colors.$4,
        width: currentWidth,
        ...props.style,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={classNames(
        `px-2 lg:px-2.5 xl:px-4 text-left font-medium tracking-wider whitespace-nowrap ${props.className}`,
        {
          'border-r relative': props.resizable,
          uppercase: !props.disableUppercase,
          'py-2': !props.withoutVerticalPadding,
          'text-xs': props.textSize === 'extraSmall' || !props.textSize,
          'text-sm': props.textSize === 'small',
        }
      )}
      onMouseMove={handleMouseMove}
    >
      <div
        className={`flex items-center space-x-1 ${props.childrenClassName} select-none`}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {props.onColumnClick ? (
          <div
            className="flex items-center space-x-1 overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer"
            onClick={handleClick}
            style={{
              width: currentWidth !== -1 ? currentWidth : 'auto',
            }}
          >
            <span className="overflow-hidden whitespace-nowrap text-ellipsis">
              {props.children}
            </span>

            <div
              className={classNames('flex items-center bg-opacity-25', {
                hidden: currentWidth === -1 ? false : currentWidth < 50,
              })}
            >
              {props.useOnlyCurrentSortDirectionIcon ? (
                <>
                  {props.isCurrentlyUsed && (
                    <>{order === 'desc' ? props.descIcon : props.ascIcon}</>
                  )}
                </>
              ) : (
                <>
                  {props.isCurrentlyUsed ? (
                    <div className="flex flex-col items-center justify-center -space-y-4">
                      <FaSortUp
                        className={classNames({
                          'opacity-30': order !== 'asc',
                        })}
                        size={16}
                      />

                      <FaSortDown
                        className={classNames({
                          'opacity-30': order !== 'desc',
                        })}
                        size={16}
                      />
                    </div>
                  ) : (
                    <FaSort size={16} className="opacity-30" />
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <span>{props.children}</span>
        )}
      </div>

      {props.resizable ? (
        <span
          className={classNames(
            'column-resizer block absolute inset-y-0 right-0 m-0 w-1 h-full p-0 cursor-col-resize border border-transparent hover:bg-white hover:transition duration-50',
            {
              'bg-white': isResizing,
            }
          )}
        ></span>
      ) : null}
    </th>
  );
}

export const Th = React.memo(Th$);

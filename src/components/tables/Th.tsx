/**
* Invoice Ninja (https://invoiceninja.com).
*
* @link https://github.com/invoiceninja/invoiceninja source repository
*
* @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
*
* @license https://www.elastic.co/licensing/elastic-license
*/

import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import CommonProps from '../../common/interfaces/common-props.interface';
import { ChevronDown, ChevronUp } from 'react-feather';
import { useColorScheme } from '$app/common/colors';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { get } from 'lodash';

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
}

const defaultProps: Props = {
  isCurrentlyUsed: false,
};

const currentWidthAtom = atomWithStorage<Record<string, number>>(
  'columnWidths',
  {}
);

export function Th(props: Props) {
  props = { ...defaultProps, ...props };

  const thRef = useRef<HTMLTableCellElement>(null);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState<number>(0);

  const [widths, setWidths] = useAtom(currentWidthAtom);

  const currentWidth = () => {
    if (props.resizable) {
      return get(widths, props.resizable, 0);
    }

    return 0;
  };

  function setCurrentWidth(width: number) {
    if (!props.resizable) {
      return;
    }

    setWidths((prev) => ({ ...prev, [props.resizable!]: width }));
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!props.resizable || e.button !== 0) return; // Only left mouse button and if resizable is true

    const thWidth = thRef.current?.offsetWidth;
    const clickPosition =
      e.clientX - thRef.current!.getBoundingClientRect().left;

    const borderThreshold = 40; // Increased threshold to make the resize area larger

    if (thWidth && clickPosition > thWidth - borderThreshold) {
      setIsResizing(true);
      setStartX(e.clientX);

      // Disable text selection on the table while resizing
      const table = thRef.current?.closest('table'); // Find the closest parent table
      if (table) {
        table.style.userSelect = 'none';
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !thRef.current) return;

    const dx = e.clientX - startX;

    const newWidth = currentWidth() + dx;

    // Apply width limits (e.g., between 50px and 1000px)
    if (newWidth > 50 && newWidth < 1000) {
      setCurrentWidth(newWidth);
      thRef.current.style.width = `${newWidth}px`;
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);

    // Re-enable text selection after resizing
    const table = thRef.current?.closest('table'); // Find the closest parent table
    if (table) {
      table.style.userSelect = '';
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Handle double-click to restore the column width to original
  const handleDoubleClick = () => {
    if (props.resizable) {
      setCurrentWidth(0);
      if (thRef.current) {
        thRef.current.style.width = `0px`;
      }
    }
  };

  function handleClick(event: React.MouseEvent) {
    if (isResizing) return;

    const thWidth = (event.currentTarget as HTMLElement).offsetWidth;
    const clickPosition =
      event.clientX - event.currentTarget.getBoundingClientRect().left;

    const borderThreshold = 30;

    if (clickPosition > thWidth - borderThreshold) {
      return; // safe zone
    } else {
      if (props.onColumnClick) {
        setOrder(order === 'desc' ? 'asc' : 'desc');

        props.onColumnClick({
          sort: `${props.id}|${order}`,
          field: props.id,
        });
      }
    }
  }

  function handleMouseEnter(event: React.MouseEvent) {
    if (props.resizable) {
      const thWidth = thRef.current?.offsetWidth;
      const clickPosition =
        event.clientX - thRef.current!.getBoundingClientRect().left;

      const borderThreshold = 40; // Increased threshold for resizing cursor

      if (thWidth && clickPosition > thWidth - borderThreshold) {
        thRef.current!.style.cursor = 'ew-resize'; // Only set cursor if resizable
      } else {
        thRef.current!.style.cursor = '';
      }
    }
  }

  function handleMouseLeave() {
    thRef.current!.style.cursor = '';
  }

  const colors = useColorScheme();

  return (
    <th
      ref={thRef}
      style={{
        color: props.textColor || colors.$9,
        borderColor: colors.$4,
        width: `${currentWidth()}px`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={classNames(
        `px-2 lg:px-2.5 xl:px-4 py-2.5 text-left text-xs font-medium tracking-wider whitespace-nowrap ${props.className}`,
        {
          'cursor-pointer': props.onColumnClick,
          uppercase: !props.disableUppercase,
          'border-r': props.resizable,
        }
      )}
    >
      <div
        className={`flex items-center space-x-1 ${props.childrenClassName} select-none`}
      >
        {props.onColumnClick ? (
          <div className="flex items-center space-x-1" onClick={handleClick}>
            <span>{props.children}</span>

            <div className="flex items-center">
              <ChevronUp
                className={classNames('opacity-25', {
                  'opacity-100': order === 'asc' && props.isCurrentlyUsed,
                })}
                size={16}
              />
              <ChevronDown
                className={classNames('opacity-25', {
                  'opacity-100': order === 'desc' && props.isCurrentlyUsed,
                })}
                size={16}
              />
            </div>
          </div>
        ) : (
          <span>{props.children}</span>
        )}
      </div>
    </th>
  );
}

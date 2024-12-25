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
import { useColorScheme } from '$app/common/colors';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { get } from 'lodash';
import { ChevronDown, ChevronUp } from 'react-feather';

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

export function useResizeColumn(resizable: string | undefined) {
  const thRef = useRef<HTMLTableCellElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState<number>(0);
  const [widths, setWidths] = useAtom(currentWidthAtom);

  const currentWidth = () => {
    if (resizable) {
      return get(widths, resizable, 0);
    }
    return 0;
  };

  function setCurrentWidth(width: number) {
    if (!resizable) return;
    setWidths((prev) => ({ ...prev, [resizable]: width }));
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable || e.button !== 0) return;

    const thWidth = thRef.current?.offsetWidth;
    const clickPosition =
      e.clientX - thRef.current!.getBoundingClientRect().left;
    const borderThreshold = 60;

    if (thWidth && clickPosition > thWidth - borderThreshold) {
      setIsResizing(true);
      setStartX(e.clientX);
      const table = thRef.current?.closest('table');
      if (table) {
        table.style.userSelect = 'none';
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !thRef.current) return;

    const dx = e.clientX - startX;
    const sensitivityFactor = 1.25;
    const newWidth = currentWidth() + dx * sensitivityFactor;

    if (newWidth >= 50 && newWidth <= 1000) {
      setCurrentWidth(newWidth);
      thRef.current.style.width = `${newWidth}px`;
    }

    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsResizing(false);

    const table = thRef.current?.closest('table');
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

  const handleDoubleClick = (e: React.MouseEvent) => {
    const borderThreshold = 40;
    const thWidth = thRef.current?.offsetWidth;
    const clickPosition =
      e.clientX - thRef.current!.getBoundingClientRect().left;

    if (resizable && thWidth && clickPosition > thWidth - borderThreshold) {
      setCurrentWidth(0);
      if (thRef.current) {
        thRef.current.style.width = `0px`;
      }
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (resizable) {
      const thWidth = thRef.current?.offsetWidth;
      const clickPosition =
        event.clientX - thRef.current!.getBoundingClientRect().left;
      const borderThreshold = 40;

      if (thWidth && clickPosition > thWidth - borderThreshold) {
        thRef.current!.style.cursor = 'ew-resize';
      } else {
        thRef.current!.style.cursor = '';
      }
    }
  };

  const handleMouseLeave = () => {
    thRef.current!.style.cursor = '';
  };

  return {
    thRef,
    currentWidth,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    setCurrentWidth,
  };
}

export function Th(props: Props) {
  props = { ...defaultProps, ...props };

  const {
    thRef,
    currentWidth,
    handleMouseDown,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
  } = useResizeColumn(props.resizable);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  function handleClick() {
    if (props.onColumnClick) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
      props.onColumnClick({
        sort: `${props.id}|${order}`,
        field: props.id,
      });
    }
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

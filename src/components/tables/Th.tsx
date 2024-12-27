/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import classNames from 'classnames';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';
import { useAtom } from 'jotai';
import { get } from 'lodash';
import { atomWithStorage } from 'jotai/utils';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';

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

export const currentWidthAtom = atomWithStorage<Record<string, number>>(
  'columnWidths',
  {}
);

export function useResizeColumn(resizable: string | undefined) {
  const thRef = useRef<HTMLTableCellElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);
  const [widths, setWidths] = useAtom(currentWidthAtom);

  const currentWidth = useMemo(() => {
    if (resizable) {
      return get(widths, resizable, -1);
    }
    return -1;
  }, [widths, resizable]);

  const setCurrentWidth = useCallback(
    (width: number) => {
      if (!resizable) return;
      setWidths((prev) => ({ ...prev, [resizable]: width }));
    },
    [resizable]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!resizable || e.button !== 0) return;

      const thWidth = thRef.current?.offsetWidth;
      const clickPosition =
        e.clientX - thRef.current!.getBoundingClientRect().left;
      const borderThreshold = 15;

      if (thWidth && clickPosition > thWidth - borderThreshold) {
        setIsResizing(true);
        setStartX(e.clientX);
        setStartWidth(thWidth);
        const table = thRef.current?.closest('table');
        if (table) {
          table.style.userSelect = 'none';
        }
      }
    },
    [resizable]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !thRef.current || currentWidth === null) return;

      const dx = e.clientX - startX;
      const newWidth = startWidth + dx;

      if (newWidth > 25 && newWidth <= 1000) {
        setCurrentWidth(newWidth);
        thRef.current.style.width = `${newWidth}px`;
      }
    },
    [isResizing, startX, startWidth, currentWidth, setCurrentWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);

    const table = thRef.current?.closest('table');
    if (table) {
      table.style.userSelect = '';
    }
  }, []);

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
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const borderThreshold = 40;
      const thWidth = thRef.current?.offsetWidth;
      const clickPosition =
        e.clientX - thRef.current!.getBoundingClientRect().left;

      if (resizable && thWidth && clickPosition > thWidth - borderThreshold) {
        setCurrentWidth(-1);
        if (thRef.current) {
          thRef.current.style.width = `auto`;
        }
      }
    },
    [resizable, setCurrentWidth]
  );

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
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
    },
    [resizable]
  );

  const handleMouseLeave = useCallback(() => {
    thRef.current!.style.cursor = '';
  }, []);

  const handleMouseOver = useCallback(
    (event: React.MouseEvent) => handleMouseEnter(event),
    [resizable]
  );

  return {
    thRef,
    currentWidth,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseOver,
    setCurrentWidth,
    isResizing,
  };
}

export function Th$(props: Props) {
  props = { ...defaultProps, ...props };

  const {
    thRef,
    currentWidth,
    handleMouseDown,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseOver,
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
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        handleMouseLeave();
      }}
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
      onMouseOver={handleMouseOver}
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
            className="flex items-center space-x-1 overflow-hidden whitespace-nowrap text-ellipsis"
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
            </div>
          </div>
        ) : (
          <span>{props.children}</span>
        )}
      </div>
    </th>
  );
}

export const Th = React.memo(Th$);

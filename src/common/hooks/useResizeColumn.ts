import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAtom } from 'jotai';
import { get } from 'lodash';
import { atomWithStorage } from 'jotai/utils';

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

  const inResizeZone = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      const borderThreshold = 10;
      const thWidth = thRef.current?.offsetWidth;
      const clickPosition =
        event.clientX - thRef.current!.getBoundingClientRect().left;

      return thWidth && clickPosition > thWidth - borderThreshold;
    },
    [thRef]
  );

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
    (e: MouseEvent | React.MouseEvent) => {
      document.body.style.cursor = inResizeZone(e) && resizable ? 'ew-resize' : '';

      if (!isResizing || !thRef.current || currentWidth === null) return;

      const dx = e.clientX - startX;
      const newWidth = startWidth + dx - 45; // Safe offset for snapping to the right when starting the drag

      console.log({ dx, newWidth });
      
      if (newWidth >= 1) {
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

    const table = thRef.current?.closest('table');

    if (table) {
      if (isResizing) {
        table.classList.add('is-resizing');
      } else {
        table.classList.remove('is-resizing');
      }
    }

    document.body.style.cursor = isResizing && resizable ? 'ew-resize' : '';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const borderThreshold = 30;
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

  return {
    thRef,
    currentWidth,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    setCurrentWidth,
    isResizing,
    inResizeZone,
  };
}

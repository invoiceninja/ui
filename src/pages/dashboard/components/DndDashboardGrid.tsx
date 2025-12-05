import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type GridLayout from 'react-grid-layout';

type LayoutItem = GridLayout.Layout;

interface Props {
  layout: LayoutItem[];
  setLayout: (l: LayoutItem[]) => void;
  isEditMode: boolean;
  renderPanel: (id: string) => React.ReactNode;
  cols?: number; // default 1000 (to match existing)
  rowHeight?: number; // default 20
}

function isColliding(a: LayoutItem, b: LayoutItem): boolean {
  const ax2 = (a.x || 0) + (a.w || 0);
  const ay2 = (a.y || 0) + (a.h || 0);
  const bx2 = (b.x || 0) + (b.w || 0);
  const by2 = (b.y || 0) + (b.h || 0);
  return (a.x || 0) < bx2 && ax2 > (b.x || 0) && (a.y || 0) < by2 && ay2 > (b.y || 0);
}

function isHorizOver(a: LayoutItem, b: LayoutItem): boolean {
  const ax2 = (a.x || 0) + (a.w || 0);
  const bx2 = (b.x || 0) + (b.w || 0);
  return (a.x || 0) < bx2 && ax2 > (b.x || 0);
}

function resolveOverlaps(layout: LayoutItem[]): LayoutItem[] {
  const placed: LayoutItem[] = [];
  const sorted = [...layout].sort((l1, l2) => (l1.y || 0) - (l2.y || 0) || (l1.x || 0) - (l2.x || 0));
  for (const item of sorted) {
    const clone = { ...item } as LayoutItem;
    while (placed.some((p) => isColliding(clone, p))) {
      const blockers = placed.filter((p) => isColliding(clone, p));
      const maxY = Math.max(...blockers.map((b) => (b.y || 0) + (b.h || 0)));
      clone.y = Math.max(clone.y || 0, maxY);
    }
    placed.push(clone);
  }
  return placed;
}

function resolveOverlapsAnchored(layout: LayoutItem[], anchorId: string, anchorTopY?: number): LayoutItem[] {
  const itemsById = new Map(layout.map((i) => [i.i, { ...i }]));
  const anchor = itemsById.get(anchorId);
  if (!anchor) return resolveOverlaps(layout);
  if (typeof anchorTopY === 'number') anchor.y = anchorTopY;
  const placed: LayoutItem[] = [{ ...anchor }];
  const others = layout.filter((i) => i.i !== anchorId).sort((l1, l2) => (l1.y || 0) - (l2.y || 0) || (l1.x || 0) - (l2.x || 0));
  for (const item of others) {
    const clone = { ...item } as LayoutItem;
    while (placed.some((p) => isColliding(clone, p))) {
      const blockers = placed.filter((p) => isColliding(clone, p));
      const maxY = Math.max(...blockers.map((b) => (b.y || 0) + (b.h || 0)));
      clone.y = Math.max(clone.y || 0, maxY);
    }
    placed.push(clone);
  }
  return placed;
}

function compactVertical(layout: LayoutItem[], preserveAnchorId?: string): LayoutItem[] {
  const items = layout.map((i) => ({ ...i }));
  items.sort((l1, l2) => (l1.y || 0) - (l2.y || 0) || (l1.x || 0) - (l2.x || 0));
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    if (preserveAnchorId && item.i === preserveAnchorId) continue;
    let targetY = 0;
    for (let j = 0; j < items.length; j++) {
      if (j === idx) continue;
      const other = items[j];
      if (!isHorizOver(item, other)) continue;
      const otherBottom = (other.y || 0) + (other.h || 0);
      if (otherBottom <= (item.y || 0)) targetY = Math.max(targetY, otherBottom);
    }
    item.y = targetY;
  }
  items.sort((l1, l2) => (l1.y || 0) - (l2.y || 0) || (l1.x || 0) - (l2.x || 0));
  return items;
}

export function DndDashboardGrid(props: Props) {
  const { layout, setLayout, isEditMode, renderPanel } = props;
  const cols = props.cols ?? 1000;
  const rowHeight = props.rowHeight ?? 20;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1200);
  const colUnit = useMemo(() => (containerWidth > 0 ? containerWidth / cols : 1), [containerWidth, cols]);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const el = entries[0]?.contentRect;
      if (el) setContainerWidth(el.width);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const [working, setWorking] = useState<LayoutItem[]>(layout.map((l) => ({ ...l })));
  useEffect(() => setWorking(layout.map((l) => ({ ...l }))), [layout]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 120, tolerance: 3 } }));
  const [dragId, setDragId] = useState<string | null>(null);
  const [resize, setResize] = useState<{ id: string; edge: 's' | 'e' | 'w' | 'se' | 'sw'; originX: number; originY: number; start: LayoutItem } | null>(null);

  const getById = (id: string) => working.find((i) => i.i === id);

  const pxToUnits = (dx: number, dy: number) => ({ dxu: Math.round(dx / colUnit), dyu: Math.round(dy / rowHeight) });

  const handlePointerDownDrag = (e: React.MouseEvent, id: string) => {
    if (!isEditMode) return;
    // Only start if event target is inside a drag-handle
    const path = e.nativeEvent.composedPath() as HTMLElement[];
    if (!path.some((el) => (el as HTMLElement).classList?.contains('drag-handle'))) return;
    setDragId(id);
  };

  useEffect(() => {
    if (!dragId) return;
    const item = getById(dragId);
    if (!item) return;
    const startX = (item.x || 0) * colUnit;
    const startY = (item.y || 0) * rowHeight;
    let lastX = 0,
      lastY = 0;
    const onMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      const dx = px - startX;
      const dy = py - startY;
      const { dxu, dyu } = pxToUnits(dx, dy);
      if (dxu === lastX && dyu === lastY) return;
      lastX = dxu;
      lastY = dyu;
      // Move relative to the item's original grid position to avoid jump on drag start
      setWorking((prev) =>
        prev.map((it) =>
          it.i === dragId
            ? {
                ...it,
                x: Math.max(0, (item.x || 0) + dxu),
                y: Math.max(0, (item.y || 0) + dyu),
              }
            : it
        )
      );
    };
    const onUp = () => {
      setDragId(null);
      // Resolve overlaps and compact
      setWorking((prev) => {
        const anchored = resolveOverlapsAnchored(prev, item.i, item.y);
        const compacted = compactVertical(anchored);
        setLayout(compacted);
        return compacted;
      });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragId, colUnit, rowHeight]);

  const handleResizeDown = (
    e: React.MouseEvent,
    id: string,
    edge: 's' | 'e' | 'w' | 'se' | 'sw'
  ) => {
    if (!isEditMode) return;
    e.stopPropagation();
    const start = { ...(getById(id) as LayoutItem) };
    const originX = e.clientX;
    const originY = e.clientY;
    setResize({ id, edge, originX, originY, start });
  };

  useEffect(() => {
    if (!resize) return;
    const { id, edge, originX, originY, start } = resize;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - originX;
      const dy = ev.clientY - originY;
      const { dxu, dyu } = pxToUnits(dx, dy);
      setWorking((prev) =>
        prev.map((it) => {
          if (it.i !== id) return it;
          let x = it.x || 0;
          let w = it.w || 1;
          let h = it.h || 1;
          if (edge.includes('e')) w = Math.max(start.w + dxu, it.minW || 1);
          if (edge.includes('w')) {
            const newW = Math.max(start.w - dxu, it.minW || 1);
            const delta = (start.w - newW);
            x = Math.max(0, start.x + dxu);
            w = newW;
          }
          if (edge.includes('s')) h = Math.max(start.h + dyu, it.minH || 1);
          return { ...it, x, w, h };
        })
      );
    };
    const onUp = () => {
      // Resolve and compact while anchoring the resized item top
      setWorking((prev) => {
        const curr = prev.find((i) => i.i === id)!;
        const anchored = resolveOverlapsAnchored(prev, id, start.y);
        const compacted = compactVertical(anchored, id);
        setLayout(compacted);
        return compacted;
      });
      setResize(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resize, colUnit, rowHeight]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <DndContext sensors={sensors}>
        {working.map((item) => {
          const left = (item.x || 0) * colUnit;
          const top = (item.y || 0) * rowHeight;
          const width = (item.w || 1) * colUnit;
          const height = (item.h || 1) * rowHeight;
          const isActive = dragId === item.i || resize?.id === item.i;
          return (
            <div
              key={item.i}
              style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                transition: isActive ? 'none' : 'transform 0.15s ease, width 0.15s ease, height 0.15s ease',
              }}
              className="react-grid-item"
              onMouseDown={(e) => handlePointerDownDrag(e, item.i)}
            >
              {/* Resize handles (edit mode only) */}
              {isEditMode && (
                <>
                  <div
                    className="react-resizable-handle react-resizable-handle-s"
                    onMouseDown={(e) => handleResizeDown(e, item.i, 's')}
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10 }}
                  />
                  <div
                    className="react-resizable-handle react-resizable-handle-e"
                    onMouseDown={(e) => handleResizeDown(e, item.i, 'e')}
                    style={{ position: 'absolute', top: 0, right: 0, width: 10, height: '100%' }}
                  />
                  <div
                    className="react-resizable-handle react-resizable-handle-w"
                    onMouseDown={(e) => handleResizeDown(e, item.i, 'w')}
                    style={{ position: 'absolute', top: 0, left: 0, width: 10, height: '100%' }}
                  />
                </>
              )}
              {/* Panel content */}
              <div className="no-drag-zone" style={{ width: '100%', height: '100%' }}>{renderPanel(item.i)}</div>
            </div>
          );
        })}
      </DndContext>
    </div>
  );
}

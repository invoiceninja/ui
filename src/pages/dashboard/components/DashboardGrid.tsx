import { useCallback, useEffect, useMemo, useRef } from 'react';
import { GridStack } from 'gridstack';
import type { GridStackInstance, GridStackNode } from 'gridstack';
import 'gridstack/dist/gridstack.css';
import classNames from 'classnames';
import type {
  DashboardGridItem,
  DashboardGridLayout,
  DashboardGridMetrics,
} from './DashboardGrid.types';

interface DashboardGridProps {
  layout: DashboardGridLayout;
  editable: boolean;
  metrics: DashboardGridMetrics;
  onLayoutChange: (layout: DashboardGridLayout) => void;
  renderItem: (id: string) => React.ReactNode;
  className?: string;
}

function toLayout(nodes: GridStackNode[]): DashboardGridLayout {
  return nodes
    .filter((node) => Boolean(node.id || node.el?.dataset.gsId))
    .map((node) => ({
      i: String(node.id || node.el?.dataset.gsId),
      x: node.x ?? 0,
      y: node.y ?? 0,
      w: node.w ?? 1,
      h: node.h ?? 1,
      minW: node.minW ?? undefined,
      minH: node.minH ?? undefined,
      maxW: node.maxW ?? undefined,
      maxH: node.maxH ?? undefined,
      static: node.noMove && node.noResize ? true : undefined,
    }));
}

export function DashboardGrid({
  layout,
  editable,
  metrics,
  onLayoutChange,
  renderItem,
  className,
}: DashboardGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<GridStackInstance | null>(null);

  const orderedLayout = useMemo(() => {
    return [...layout].sort((a, b) => {
      const aNum = Number(a.i);
      const bNum = Number(b.i);

      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return aNum - bNum;
      }

      return String(a.i).localeCompare(String(b.i));
    });
  }, [layout]);

  const options = useMemo(
    () => ({
      column: metrics.cols,
      cellHeight: metrics.rowHeight,
      margin: 8,
      float: false,
      disableOneColumnMode: true,
      draggable: {
        handle: '.dashboard-card__drag-handle',
        ignoreContent: true,
      },
      resizable: {
        handles: 'all',
      },
    }),
    [metrics]
  );

  const syncLayout = useCallback(
    (grid: GridStackInstance) => {
      const existing = new Map<string, GridStackNode>();
      grid.engine.nodes.forEach((node) => {
        if (node.id || node.el?.dataset.gsId) {
          existing.set(String(node.id || node.el?.dataset.gsId), node);
        }
      });

      layout.forEach((item) => {
        const node = existing.get(item.i);
        if (node && node.el) {
          grid.update(node.el as HTMLElement, {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            minW: item.minW,
            minH: item.minH,
            maxW: item.maxW,
            maxH: item.maxH,
            noMove: item.static ?? false,
            noResize: item.static ?? false,
          });
        }
      });

      grid.batchUpdate();
      grid.commit();
    },
    [layout]
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const grid = GridStack.init(options, containerRef.current);
    instanceRef.current = grid;

    const items = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('.grid-stack-item')
    );

    items.forEach((item) => {
      grid.makeWidget(item);
    });

    const handleChange = () => {
      onLayoutChange(toLayout(grid.engine.nodes));
    };

    grid.on('change', handleChange);
    grid.on('dragstop', handleChange);
    grid.on('resizestop', handleChange);

    return () => {
      grid.destroy(false);
      instanceRef.current = null;
    };
  }, [options, onLayoutChange]);

  useEffect(() => {
    if (instanceRef.current) {
      syncLayout(instanceRef.current);
    }
  }, [layout, syncLayout]);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setStatic(!editable);
    }
  }, [editable]);

  return (
    <div
      ref={containerRef}
      className={classNames('grid-stack', className, {
        'dashboard-edit-mode': editable,
      })}
    >
      {orderedLayout.map((item) => (
        <div
          key={item.i}
          className="grid-stack-item"
          data-gs-id={item.i}
          data-gs-x={item.x}
          data-gs-y={item.y}
          data-gs-w={item.w}
          data-gs-h={item.h}
          data-gs-min-w={item.minW}
          data-gs-min-h={item.minH}
          data-gs-max-w={item.maxW}
          data-gs-max-h={item.maxH}
          data-gs-no-move={item.static ? 'true' : undefined}
          data-gs-no-resize={item.static ? 'true' : undefined}
        >
          <div className="grid-stack-item-content dashboard-grid-item">
            {renderItem(item.i)}
          </div>
        </div>
      ))}
    </div>
  );
}

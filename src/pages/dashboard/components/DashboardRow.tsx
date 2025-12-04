import { ReactNode, useMemo } from 'react';
import GridLayout from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { DashboardRow as DashboardRowType } from '../types/DashboardRowTypes';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardRowProps {
  row: DashboardRowType;
  breakpoint: string;
  isEditMode: boolean;
  onPanelLayoutChange: (rowId: string, layout: GridLayout.Layout[]) => void;
  onRowResize: (rowId: string, newHeight: number) => void;
  renderPanel: (panelId: string) => ReactNode;
  cols: { [key: string]: number };
}

export function DashboardRow({
  row,
  breakpoint,
  isEditMode,
  onPanelLayoutChange,
  onRowResize,
  renderPanel,
  cols,
}: DashboardRowProps) {
  // Convert row panels to flat layout for react-grid-layout
  // Memoize to prevent unnecessary recalculations that trigger height changes
  const panelLayout: GridLayout.Layout[] = useMemo(() => {
    return row.panels.map((panel) => ({
      i: panel.i,
      x: panel.x,
      y: 0, // Always 0 within row context
      w: panel.w,
      h: row.h, // All panels inherit row height
      minW: panel.minW,
      maxW: panel.maxW,
      static: panel.static,
      isDraggable: panel.isDraggable !== false && isEditMode,
      isResizable: panel.isResizable !== false && isEditMode,
    }));
  }, [row.panels, row.h, row.id, isEditMode]);

  const handleResizeStop = (
    layout: GridLayout.Layout[]
  ) => {
    // Lock height - never allow panel height changes
    // Only horizontal resizing is allowed
    const lockedLayout = layout.map((item) => ({
      ...item,
      h: row.h, // Force height back to row height
      y: 0, // Force y position to 0
    }));

    // Don't update if widths haven't actually changed
    const hasChanges = layout.some((item, idx) => {
      const panel = row.panels[idx];
      return item.x !== panel?.x || item.w !== panel?.w;
    });

    if (!hasChanges) return;

    onPanelLayoutChange(row.id, lockedLayout);
  };

  const handleDragStop = (layout: GridLayout.Layout[]) => {
    // Lock height and y position after drag
    const lockedLayout = layout.map((item) => ({
      ...item,
      h: row.h, // Force height back to row height
      y: 0, // Force y position to 0
    }));

    // Don't update if positions haven't actually changed
    const hasChanges = layout.some((item, idx) => {
      const panel = row.panels[idx];
      return item.x !== panel?.x || item.w !== panel?.w;
    });

    if (!hasChanges) return;

    onPanelLayoutChange(row.id, lockedLayout);
  };

  return (
    <div
      className="dashboard-row"
      style={{
        position: 'relative',
        marginBottom: '20px',
        border: isEditMode ? '1px dashed rgba(255, 255, 255, 0.2)' : 'none',
        borderRadius: '4px',
        padding: isEditMode ? '8px' : '0',
        height: `${row.h}px`,
        minHeight: `${row.h}px`,
        maxHeight: `${row.h}px`,
        overflow: 'hidden',
      }}
    >
      <ResponsiveGridLayout
        className="dashboard-row-grid"
        layouts={{ [breakpoint]: panelLayout }}
        breakpoints={{
          xxl: 1600,
          xl: 1200,
          lg: 1000,
          md: 800,
          sm: 600,
          xs: 300,
          xxs: 0,
        }}
        cols={cols}
        rowHeight={1}
        margin={[0, 0]}
        containerPadding={[0, 0]}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        maxRows={1}
        draggableHandle=".drag-handle"
        draggableCancel=".cancelDraggingCards"
        compactType={null}
        preventCollision={false}
        allowOverlap={false}
        resizeHandles={['e', 'w']} // Only horizontal resize within row
        onResizeStop={handleResizeStop}
        onDragStop={handleDragStop}
        onLayoutChange={() => {}} // Prevent any layout changes except through explicit handlers
        autoSize={false}
        verticalCompact={false}
      >
        {row.panels.map((panel) => (
          <div
            key={panel.i}
            className="dashboard-panel-wrapper"
            style={{
              height: '100%',
              overflow: 'auto',
            }}
          >
            {renderPanel(panel.i)}
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Row resize handle - vertical only */}
      {isEditMode && (
        <div
          className="row-resize-handle"
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '0',
            right: '0',
            height: '8px',
            cursor: 'ns-resize',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            zIndex: 100,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startHeight = row.h;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaY = moveEvent.clientY - startY;
              const newHeight = Math.max(50, startHeight + deltaY);
              onRowResize(row.id, newHeight);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
            }}
          />
        </div>
      )}
    </div>
  );
}

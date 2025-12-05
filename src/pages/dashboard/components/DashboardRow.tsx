import { ReactNode, useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { DashboardRow as DashboardRowType } from '../types/DashboardRowTypes';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardRowProps {
  row: DashboardRowType;
  breakpoint: string;
  cols: { [key: string]: number };
  isEditMode: boolean;
  renderPanel: (panelId: string) => ReactNode;
  onPanelLayoutChange: (rowId: string, layout: GridLayout.Layout[]) => void;
  onRowResize: (rowId: string, newHeight: number) => void;
  onRowDelete?: (rowId: string) => void;
}

export function DashboardRow({
  row,
  breakpoint,
  cols,
  isEditMode,
  renderPanel,
  onPanelLayoutChange,
  onRowResize,
  onRowDelete,
}: DashboardRowProps) {
  // Use controlled state with key to force remounts on height changes
  const [currentLayout, setCurrentLayout] = useState<GridLayout.Layout[]>([]);

  // Initialize and sync layout from props - use effect to update on prop changes
  useEffect(() => {
    const newLayout = row.panels.map((panel) => ({
      i: panel.i,
      x: panel.x,
      y: 0,
      w: panel.w,
      h: row.h,
      minW: panel.minW,
      maxW: panel.maxW,
      static: panel.static,
      isDraggable: panel.isDraggable !== false && isEditMode,
      isResizable: panel.isResizable !== false && isEditMode,
    }));
    setCurrentLayout(newLayout);
  }, [row.panels, row.h, row.id, isEditMode, breakpoint]);

  const handleResizeStop = (layout: GridLayout.Layout[]) => {
    // Lock height - never allow panel height changes
    const lockedLayout = layout.map((item) => ({
      ...item,
      h: row.h,
      y: 0,
    }));

    // Update local state
    setCurrentLayout(lockedLayout);
    
    // Notify parent
    onPanelLayoutChange(row.id, lockedLayout);
  };

  const handleDragStop = (layout: GridLayout.Layout[]) => {
    // Lock height and y position after drag
    const lockedLayout = layout.map((item) => ({
      ...item,
      h: row.h,
      y: 0,
    }));

    // Update local state
    setCurrentLayout(lockedLayout);
    
    // Notify parent
    onPanelLayoutChange(row.id, lockedLayout);
  };

  return (
    <div
      className="dashboard-row"
      style={{
        position: 'relative',
        width: '100%',
        marginBottom: '20px',
        border: isEditMode ? '1px dashed rgba(255, 255, 255, 0.2)' : 'none',
        borderRadius: '4px',
        padding: isEditMode ? '8px' : '0',
      }}
    >
      {/* Row resize handle (bottom) */}
      {isEditMode && onRowResize && (
        <div
          className="row-resize-handle"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            cursor: 'ns-resize',
            background: 'transparent',
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
        />
      )}

      {/* Delete row button */}
      {isEditMode && onRowDelete && (
        <button
          onClick={() => onRowDelete(row.id)}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            zIndex: 100,
            padding: '4px 8px',
            background: 'rgba(255, 0, 0, 0.7)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Delete Row
        </button>
      )}

      {/* Grid container with FIXED height */}
      <div
        style={{
          height: `${row.h}px`,
          minHeight: `${row.h}px`,
          maxHeight: `${row.h}px`,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <ResponsiveGridLayout
          key={`row-${row.id}-${row.h}-${breakpoint}`} // Force remount on height/breakpoint change
          className="dashboard-row-grid"
          layouts={{ [breakpoint]: currentLayout }}
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
          resizeHandles={['s', 'e', 'w', 'se', 'sw']}
          onResizeStop={handleResizeStop}
          onDragStop={handleDragStop}
          autoSize={false}
          verticalCompact={false}
          width={1200} // Will be overridden by WidthProvider
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
      </div>
    </div>
  );
}

import { ReactNode, useState } from 'react';
import GridLayout from 'react-grid-layout';
import { Button } from '$app/components/forms';
import {
  DashboardRow as DashboardRowType,
  DashboardRowLayout,
} from '../types/DashboardRowTypes';
import { DashboardRow } from './DashboardRow';

interface DashboardRowContainerProps {
  layout: DashboardRowLayout;
  breakpoint: string;
  isEditMode: boolean;
  onLayoutChange: (newLayout: DashboardRowLayout) => void;
  renderPanel: (panelId: string) => ReactNode;
  cols: { [key: string]: number };
}

export function DashboardRowContainer({
  layout,
  breakpoint,
  isEditMode,
  onLayoutChange,
  renderPanel,
  cols,
}: DashboardRowContainerProps) {
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);

  const handlePanelLayoutChange = (
    rowId: string,
    newPanelLayout: GridLayout.Layout[]
  ) => {
    const updatedRows = layout.rows.map((row) => {
      if (row.id !== rowId) return row;

      // Update panel positions within the row (only x and w matter)
      const updatedPanels = newPanelLayout.map((layoutItem) => {
        const existingPanel = row.panels.find((p) => p.i === layoutItem.i);
        return {
          ...existingPanel!,
          x: layoutItem.x,
          w: layoutItem.w,
        };
      });

      return {
        ...row,
        panels: updatedPanels,
      };
    });

    onLayoutChange({ rows: updatedRows });
  };

  const handleRowResize = (rowId: string, newHeight: number) => {
    const updatedRows = layout.rows.map((row) =>
      row.id === rowId ? { ...row, h: newHeight } : row
    );

    // Recalculate Y positions for all rows
    let currentY = 0;
    const repositionedRows = updatedRows.map((row) => {
      const updatedRow = { ...row, y: currentY };
      currentY += row.h + 20; // Add spacing between rows
      return updatedRow;
    });

    onLayoutChange({ rows: repositionedRows });
  };

  const handleAddRow = () => {
    const newRowId = `row-${Date.now()}`;
    const lastRow = layout.rows[layout.rows.length - 1];
    const newY = lastRow ? lastRow.y + lastRow.h + 20 : 0;

    const newRow: DashboardRowType = {
      id: newRowId,
      y: newY,
      h: 200, // Default row height
      panels: [],
    };

    onLayoutChange({ rows: [...layout.rows, newRow] });
  };

  const handleDeleteRow = (rowId: string) => {
    const updatedRows = layout.rows.filter((row) => row.id !== rowId);

    // Recalculate Y positions
    let currentY = 0;
    const repositionedRows = updatedRows.map((row) => {
      const updatedRow = { ...row, y: currentY };
      currentY += row.h + 20;
      return updatedRow;
    });

    onLayoutChange({ rows: repositionedRows });
  };

  const handleRowDragStart = (rowId: string) => {
    setDraggedRowId(rowId);
  };

  const handleRowDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    rowId: string
  ) => {
    e.preventDefault();
    if (draggedRowId && draggedRowId !== rowId) {
      setDragOverRowId(rowId);
    }
  };

  const handleRowDrop = (targetRowId: string) => {
    if (!draggedRowId || draggedRowId === targetRowId) return;

    const draggedIndex = layout.rows.findIndex((r) => r.id === draggedRowId);
    const targetIndex = layout.rows.findIndex((r) => r.id === targetRowId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder rows
    const reorderedRows = [...layout.rows];
    const [draggedRow] = reorderedRows.splice(draggedIndex, 1);
    reorderedRows.splice(targetIndex, 0, draggedRow);

    // Recalculate Y positions
    let currentY = 0;
    const repositionedRows = reorderedRows.map((row) => {
      const updatedRow = { ...row, y: currentY };
      currentY += row.h + 20;
      return updatedRow;
    });

    onLayoutChange({ rows: repositionedRows });
    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  return (
    <div className="dashboard-row-container">
      {layout.rows.map((row, index) => (
        <div
          key={row.id}
          draggable={isEditMode}
          onDragStart={() => handleRowDragStart(row.id)}
          onDragOver={(e) => handleRowDragOver(e, row.id)}
          onDrop={() => handleRowDrop(row.id)}
          onDragEnd={() => {
            setDraggedRowId(null);
            setDragOverRowId(null);
          }}
          style={{
            position: 'relative',
            opacity: draggedRowId === row.id ? 0.5 : 1,
            borderTop:
              dragOverRowId === row.id && draggedRowId !== row.id
                ? '2px solid #2196F3'
                : 'none',
          }}
        >
          {/* Row controls in edit mode */}
          {isEditMode && (
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                right: '0',
                display: 'flex',
                gap: '8px',
                zIndex: 10,
              }}
            >
              <button
                onClick={() => handleDeleteRow(row.id)}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(255, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 0, 0, 0.5)',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Delete Row
              </button>
            </div>
          )}

          <DashboardRow
            row={row}
            breakpoint={breakpoint}
            isEditMode={isEditMode}
            onPanelLayoutChange={handlePanelLayoutChange}
            onRowResize={handleRowResize}
            renderPanel={renderPanel}
            cols={cols}
          />
        </div>
      ))}

      {/* Add Row button */}
      {isEditMode && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button onClick={handleAddRow} type="minimal">
            + Add Row
          </Button>
        </div>
      )}
    </div>
  );
}

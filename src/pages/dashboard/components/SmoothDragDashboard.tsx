import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './dashboard-smooth.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function SmoothDragDashboard() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'card1', x: 0, y: 0, w: 4, h: 4 },
      { i: 'card2', x: 4, y: 0, w: 4, h: 4 },
      { i: 'card3', x: 8, y: 0, w: 4, h: 4 },
      { i: 'card4', x: 0, y: 4, w: 6, h: 3 },
      { i: 'card5', x: 6, y: 4, w: 6, h: 3 },
      { i: 'card6', x: 0, y: 7, w: 3, h: 3 },
      { i: 'card7', x: 3, y: 7, w: 3, h: 3 },
      { i: 'card8', x: 6, y: 7, w: 3, h: 3 },
      { i: 'card9', x: 9, y: 7, w: 3, h: 3 },
    ],
    md: [
      { i: 'card1', x: 0, y: 0, w: 5, h: 4 },
      { i: 'card2', x: 5, y: 0, w: 5, h: 4 },
      { i: 'card3', x: 0, y: 4, w: 5, h: 4 },
      { i: 'card4', x: 5, y: 4, w: 5, h: 3 },
      { i: 'card5', x: 0, y: 8, w: 10, h: 3 },
      { i: 'card6', x: 0, y: 11, w: 5, h: 3 },
      { i: 'card7', x: 5, y: 11, w: 5, h: 3 },
      { i: 'card8', x: 0, y: 14, w: 5, h: 3 },
      { i: 'card9', x: 5, y: 14, w: 5, h: 3 },
    ],
    sm: [
      { i: 'card1', x: 0, y: 0, w: 6, h: 4 },
      { i: 'card2', x: 0, y: 4, w: 6, h: 4 },
      { i: 'card3', x: 0, y: 8, w: 6, h: 4 },
      { i: 'card4', x: 0, y: 12, w: 6, h: 3 },
      { i: 'card5', x: 0, y: 15, w: 6, h: 3 },
      { i: 'card6', x: 0, y: 18, w: 3, h: 3 },
      { i: 'card7', x: 3, y: 18, w: 3, h: 3 },
      { i: 'card8', x: 0, y: 21, w: 3, h: 3 },
      { i: 'card9', x: 3, y: 21, w: 3, h: 3 },
    ],
  });

  // Update static property when edit mode changes
  useEffect(() => {
    setLayouts(prevLayouts => {
      const updated: any = {};
      Object.keys(prevLayouts).forEach(breakpoint => {
        updated[breakpoint] = (prevLayouts as any)[breakpoint].map((item: any) => ({
          ...item,
          static: !isEditMode
        }));
      });
      return updated;
    });
  }, [isEditMode]);

  const handleLayoutChange = (layout: any, allLayouts: any) => {
    // Only update if actually in edit mode to prevent unnecessary re-renders
    if (isEditMode) {
      setLayouts(allLayouts);
      localStorage.setItem('smoothDashboardLayouts', JSON.stringify(allLayouts));
    }
  };

  const cardColors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
    '#6366F1', // indigo
  ];

  const renderCard = (id: string, index: number) => (
    <div
      key={id}
      style={{
        backgroundColor: cardColors[index],
        color: 'white',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: isEditMode ? '2px dashed rgba(255,255,255,0.5)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
        Card {index + 1}
      </div>
      <div style={{ fontSize: '14px', opacity: 0.9 }}>
        {id}
      </div>
      {isEditMode && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '12px',
        }}>
          Drag to move
        </div>
      )}
    </div>
  );

  return (
    <div className={isEditMode ? 'edit-mode' : ''}>
      {/* Control Bar */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            Smooth Drag Dashboard
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            {isEditMode ? 'Drag cards to rearrange them' : 'Click Edit to customize your layout'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{
            padding: '6px 12px',
            backgroundColor: isEditMode ? '#FEE2E2' : '#D1FAE5',
            color: isEditMode ? '#DC2626' : '#059669',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}>
            {isEditMode ? 'EDIT MODE' : 'VIEW MODE'}
          </span>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            style={{
              padding: '10px 20px',
              backgroundColor: isEditMode ? '#DC2626' : '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 200ms ease',
            }}
          >
            {isEditMode ? 'Save Layout' : 'Edit Layout'}
          </button>
          {isEditMode && (
            <button
              onClick={() => {
                localStorage.removeItem('smoothDashboardLayouts');
                window.location.reload();
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Reset to Default
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType={null}
        preventCollision={false}
        allowOverlap={false}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        transformScale={1}
        verticalCompact={false}
        draggableCancel=".no-drag"
        resizeHandles={['se', 'sw', 'ne', 'nw']}
        autoSize={true}
      >
        {['card1', 'card2', 'card3', 'card4', 'card5', 'card6', 'card7', 'card8', 'card9'].map((id, index) =>
          renderCard(id, index)
        )}
      </ResponsiveGridLayout>

      {/* Instructions */}
      {isEditMode && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1E40AF', fontSize: '16px' }}>
            Edit Mode Instructions
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#3B82F6', fontSize: '14px' }}>
            <li>Drag cards from anywhere to move them</li>
            <li>Resize cards by dragging the corners</li>
            <li>Cards will smoothly animate to their new positions</li>
            <li>Click "Save Layout" to lock your changes</li>
            <li>Click "Reset to Default" to restore the original layout</li>
          </ul>
        </div>
      )}
    </div>
  );
}

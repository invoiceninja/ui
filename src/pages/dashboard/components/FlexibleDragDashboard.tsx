import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './dashboard-smooth.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function FlexibleDragDashboard() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [dragBehavior, setDragBehavior] = useState('swap'); // 'swap', 'push', 'free'
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
  });

  // Load saved layouts on mount
  useEffect(() => {
    const saved = localStorage.getItem('flexibleDashboardLayouts');
    if (saved) {
      try {
        setLayouts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved layouts');
      }
    }
  }, []);

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
    if (isEditMode) {
      setLayouts(allLayouts);
      localStorage.setItem('flexibleDashboardLayouts', JSON.stringify(allLayouts));
    }
  };

  const getBehaviorSettings = () => {
    switch (dragBehavior) {
      case 'swap':
        return {
          preventCollision: false,
          allowOverlap: false,
          compactType: null as 'vertical' | 'horizontal' | null,
          verticalCompact: false,
        };
      case 'push':
        return {
          preventCollision: false,
          allowOverlap: false,
          compactType: 'vertical' as 'vertical' | 'horizontal' | null,
          verticalCompact: true,
        };
      case 'free':
        return {
          preventCollision: false,
          allowOverlap: true,
          compactType: null as 'vertical' | 'horizontal' | null,
          verticalCompact: false,
        };
      default:
        return {
          preventCollision: false,
          allowOverlap: false,
          compactType: null as 'vertical' | 'horizontal' | null,
          verticalCompact: false,
        };
    }
  };

  const cardColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1',
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
        cursor: isEditMode ? 'move' : 'default',
        transition: 'all 200ms ease',
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
        Card {index + 1}
      </div>
      <div style={{ fontSize: '14px', opacity: 0.9 }}>
        {id}
      </div>
    </div>
  );

  const behaviorSettings = getBehaviorSettings();

  return (
    <div className={isEditMode ? 'edit-mode' : ''}>
      {/* Control Bar */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              Flexible Drag Dashboard
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              {isEditMode ? `Drag behavior: ${dragBehavior}` : 'Click Edit to customize your layout'}
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
              }}
            >
              {isEditMode ? 'Save Layout' : 'Edit Layout'}
            </button>
          </div>
        </div>

        {/* Drag Behavior Selector */}
        {isEditMode && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Drag Behavior:</span>
            <button
              onClick={() => setDragBehavior('swap')}
              style={{
                padding: '8px 16px',
                backgroundColor: dragBehavior === 'swap' ? '#3B82F6' : '#E5E7EB',
                color: dragBehavior === 'swap' ? 'white' : '#4B5563',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 200ms ease',
              }}
            >
              Swap (Cards exchange positions)
            </button>
            <button
              onClick={() => setDragBehavior('push')}
              style={{
                padding: '8px 16px',
                backgroundColor: dragBehavior === 'push' ? '#3B82F6' : '#E5E7EB',
                color: dragBehavior === 'push' ? 'white' : '#4B5563',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 200ms ease',
              }}
            >
              Push (Cards push others down)
            </button>
            <button
              onClick={() => setDragBehavior('free')}
              style={{
                padding: '8px 16px',
                backgroundColor: dragBehavior === 'free' ? '#3B82F6' : '#E5E7EB',
                color: dragBehavior === 'free' ? 'white' : '#4B5563',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 200ms ease',
              }}
            >
              Free (Cards can overlap)
            </button>
          </div>
        )}
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
        {...behaviorSettings}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        transformScale={1}
        draggableCancel=".no-drag"
        resizeHandles={['se', 'sw', 'ne', 'nw']}
        autoSize={true}
      >
        {['card1', 'card2', 'card3', 'card4', 'card5', 'card6', 'card7', 'card8', 'card9'].map((id, index) =>
          renderCard(id, index)
        )}
      </ResponsiveGridLayout>

      {/* Behavior Explanation */}
      {isEditMode && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1E40AF', fontSize: '16px' }}>
            Current Behavior: {dragBehavior.charAt(0).toUpperCase() + dragBehavior.slice(1)}
          </h3>
          <p style={{ margin: 0, color: '#3B82F6', fontSize: '14px' }}>
            {dragBehavior === 'swap' && 'Cards will exchange positions when you drag one over another. This creates smooth swapping without pushing other cards around.'}
            {dragBehavior === 'push' && 'Cards will push other cards down when dragged. The grid will automatically compact vertically.'}
            {dragBehavior === 'free' && 'Cards can be placed anywhere, even overlapping other cards. Maximum flexibility for custom layouts.'}
          </p>
        </div>
      )}
    </div>
  );
}

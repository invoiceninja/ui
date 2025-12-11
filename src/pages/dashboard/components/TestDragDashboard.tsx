import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function TestDragDashboard() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'a', x: 0, y: 0, w: 4, h: 3, static: false },
      { i: 'b', x: 4, y: 0, w: 4, h: 3, static: false },
      { i: 'c', x: 8, y: 0, w: 4, h: 3, static: false },
    ]
  });

  const handleLayoutChange = (layout: any, allLayouts: any) => {
    console.log('Layout changed:', allLayouts);
    setLayouts(allLayouts);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button 
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            padding: '10px 20px',
            backgroundColor: isEditMode ? 'red' : 'green',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          {isEditMode ? 'Save Layout' : 'Edit Layout'}
        </button>
        <span style={{ marginLeft: 10 }}>
          Mode: {isEditMode ? 'EDIT' : 'VIEW'}
        </span>
      </div>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType={null}
        preventCollision={false}
        allowOverlap={false}
        margin={[10, 10]}
        containerPadding={[10, 10]}
        useCSSTransforms={true}
        transformScale={1}
        verticalCompact={false}
      >
        <div key="a" style={{ 
          backgroundColor: '#ff6b6b', 
          padding: 20, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          borderRadius: 4
        }}>
          Card A
        </div>
        <div key="b" style={{ 
          backgroundColor: '#4ecdc4', 
          padding: 20, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          borderRadius: 4
        }}>
          Card B
        </div>
        <div key="c" style={{ 
          backgroundColor: '#45b7d1', 
          padding: 20, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          borderRadius: 4
        }}>
          Card C
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card } from '$app/components/cards';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function SimpleDashboard() {
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'card1', x: 0, y: 0, w: 6, h: 4 },
      { i: 'card2', x: 6, y: 0, w: 6, h: 4 },
      { i: 'card3', x: 0, y: 4, w: 12, h: 6 },
    ],
    md: [
      { i: 'card1', x: 0, y: 0, w: 10, h: 4 },
      { i: 'card2', x: 0, y: 4, w: 10, h: 4 },
      { i: 'card3', x: 0, y: 8, w: 10, h: 6 },
    ],
    sm: [
      { i: 'card1', x: 0, y: 0, w: 6, h: 4 },
      { i: 'card2', x: 0, y: 4, w: 6, h: 4 },
      { i: 'card3', x: 0, y: 8, w: 6, h: 6 },
    ],
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const handleLayoutChange = (layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    console.log('Layout changed:', allLayouts);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isEditMode ? 'Save Layout' : 'Edit Layout'}
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
        preventCollision={false}
        margin={[16, 16]}
      >
        <div key="card1">
          <Card className="h-full p-4">
            <h2 className="text-lg font-bold mb-2">Card 1 - Test Content</h2>
            <p>This is a test card to verify the grid is working.</p>
            <div className="mt-2 p-2 bg-gray-100 rounded">
              Edit Mode: {isEditMode ? 'ON' : 'OFF'}
            </div>
          </Card>
        </div>
        <div key="card2">
          <Card className="h-full p-4">
            <h2 className="text-lg font-bold mb-2">Card 2 - Another Test</h2>
            <p>Drag me when edit mode is enabled!</p>
            <div className="mt-2">
              <div className="h-2 bg-blue-500 rounded mb-1"></div>
              <div className="h-2 bg-green-500 rounded mb-1"></div>
              <div className="h-2 bg-red-500 rounded"></div>
            </div>
          </Card>
        </div>
        <div key="card3">
          <Card className="h-full p-4">
            <h2 className="text-lg font-bold mb-2">Card 3 - Large Card</h2>
            <p>This card is wider and shows that the layout is working.</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="p-2 bg-gray-200 rounded text-center">Item 1</div>
              <div className="p-2 bg-gray-200 rounded text-center">Item 2</div>
              <div className="p-2 bg-gray-200 rounded text-center">Item 3</div>
              <div className="p-2 bg-gray-200 rounded text-center">Item 4</div>
              <div className="p-2 bg-gray-200 rounded text-center">Item 5</div>
              <div className="p-2 bg-gray-200 rounded text-center">Item 6</div>
            </div>
          </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function DebugDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    console.log('DebugDashboard mounted');
    return () => console.log('DebugDashboard unmounted');
  }, []);

  useEffect(() => {
    setRenderCount((prev) => prev + 1);
    console.log(`DebugDashboard rendered ${renderCount + 1} times`);
  });

  const layouts = {
    lg: [
      { i: 'debug1', x: 0, y: 0, w: 4, h: 3 },
      { i: 'debug2', x: 4, y: 0, w: 4, h: 3 },
      { i: 'debug3', x: 8, y: 0, w: 4, h: 3 },
    ],
    md: [
      { i: 'debug1', x: 0, y: 0, w: 5, h: 3 },
      { i: 'debug2', x: 5, y: 0, w: 5, h: 3 },
      { i: 'debug3', x: 0, y: 3, w: 10, h: 3 },
    ],
    sm: [
      { i: 'debug1', x: 0, y: 0, w: 6, h: 3 },
      { i: 'debug2', x: 0, y: 3, w: 6, h: 3 },
      { i: 'debug3', x: 0, y: 6, w: 6, h: 3 },
    ],
  };

  if (!mounted) {
    return (
      <div className="p-4 border-2 border-red-500 bg-red-50">
        <p className="text-xl text-red-600">Dashboard is mounting...</p>
      </div>
    );
  }

  console.log('DebugDashboard rendering grid with layouts:', layouts);

  return (
    <div className="p-4">
      {/* Debug header */}
      <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-500 rounded">
        <h1 className="text-2xl font-bold mb-2">Debug Dashboard</h1>
        <div className="space-y-1 text-sm">
          <p>Mounted: <span className="font-bold text-green-600">YES</span></p>
          <p>Render count: <span className="font-bold">{renderCount}</span></p>
          <p>Edit mode: <span className="font-bold">{isEditMode ? 'ON' : 'OFF'}</span></p>
          <p>Window width: <span className="font-bold">{typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</span></p>
        </div>
        <Button
          onClick={() => setIsEditMode(!isEditMode)}
          className="mt-2"
        >
          Toggle Edit Mode
        </Button>
      </div>

      {/* Static cards for comparison */}
      <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 rounded">
        <h2 className="text-lg font-bold mb-2">Static Cards (Should Always Be Visible)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white border-2 border-gray-300 rounded">
            <h3 className="font-bold">Static Card 1</h3>
            <p>If you see this, React is rendering</p>
          </div>
          <div className="p-4 bg-white border-2 border-gray-300 rounded">
            <h3 className="font-bold">Static Card 2</h3>
            <p>This is outside the grid</p>
          </div>
          <div className="p-4 bg-white border-2 border-gray-300 rounded">
            <h3 className="font-bold">Static Card 3</h3>
            <p>These should always appear</p>
          </div>
        </div>
      </div>

      {/* Grid cards */}
      <div className="p-4 bg-yellow-50 border-2 border-yellow-500 rounded">
        <h2 className="text-lg font-bold mb-2">Grid Cards (Testing react-grid-layout)</h2>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={30}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          compactType={null}
          preventCollision={false}
        >
          <div key="debug1" className="bg-white border-2 border-purple-500">
            <Card className="h-full">
              <div className="p-4">
                <h3 className="text-lg font-bold text-purple-600">Grid Card 1</h3>
                <p>If you see this, the grid is working</p>
                <p className="text-xs text-gray-500 mt-2">Key: debug1</p>
              </div>
            </Card>
          </div>
          <div key="debug2" className="bg-white border-2 border-purple-500">
            <Card className="h-full">
              <div className="p-4">
                <h3 className="text-lg font-bold text-purple-600">Grid Card 2</h3>
                <p>Drag me in edit mode</p>
                <p className="text-xs text-gray-500 mt-2">Key: debug2</p>
              </div>
            </Card>
          </div>
          <div key="debug3" className="bg-white border-2 border-purple-500">
            <Card className="h-full">
              <div className="p-4">
                <h3 className="text-lg font-bold text-purple-600">Grid Card 3</h3>
                <p>Resize me in edit mode</p>
                <p className="text-xs text-gray-500 mt-2">Key: debug3</p>
              </div>
            </Card>
          </div>
        </ResponsiveGridLayout>
      </div>

      {/* Console log instructions */}
      <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-500 rounded">
        <h2 className="text-lg font-bold mb-2">Debug Instructions</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open browser console (F12)</li>
          <li>Look for "DebugDashboard mounted" message</li>
          <li>Check if static cards are visible</li>
          <li>Check if grid cards are visible</li>
          <li>Try toggling edit mode</li>
          <li>In edit mode, try dragging/resizing cards</li>
        </ol>
      </div>
    </div>
  );
}

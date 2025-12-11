/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card } from '$app/components/cards';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function GrafanaDashboard() {
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'card1', x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
      { i: 'card2', x: 4, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
      { i: 'card3', x: 8, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
      { i: 'card4', x: 0, y: 4, w: 6, h: 5, minW: 3, minH: 3 },
      { i: 'card5', x: 6, y: 4, w: 6, h: 5, minW: 3, minH: 3 },
    ],
    md: [
      { i: 'card1', x: 0, y: 0, w: 5, h: 4, minW: 2, minH: 2 },
      { i: 'card2', x: 5, y: 0, w: 5, h: 4, minW: 2, minH: 2 },
      { i: 'card3', x: 0, y: 4, w: 5, h: 4, minW: 2, minH: 2 },
      { i: 'card4', x: 5, y: 4, w: 5, h: 5, minW: 3, minH: 3 },
      { i: 'card5', x: 0, y: 9, w: 10, h: 5, minW: 3, minH: 3 },
    ],
    sm: [
      { i: 'card1', x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      { i: 'card2', x: 0, y: 4, w: 6, h: 4, minW: 2, minH: 2 },
      { i: 'card3', x: 0, y: 8, w: 6, h: 4, minW: 2, minH: 2 },
      { i: 'card4', x: 0, y: 12, w: 6, h: 5, minW: 3, minH: 3 },
      { i: 'card5', x: 0, y: 17, w: 6, h: 5, minW: 3, minH: 3 },
    ],
    xs: [
      { i: 'card1', x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
      { i: 'card2', x: 0, y: 4, w: 4, h: 4, minW: 2, minH: 2 },
      { i: 'card3', x: 0, y: 8, w: 4, h: 4, minW: 2, minH: 2 },
      { i: 'card4', x: 0, y: 12, w: 4, h: 5, minW: 2, minH: 3 },
      { i: 'card5', x: 0, y: 17, w: 4, h: 5, minW: 2, minH: 3 },
    ],
    xxs: [
      { i: 'card1', x: 0, y: 0, w: 2, h: 4, minW: 2, minH: 2 },
      { i: 'card2', x: 0, y: 4, w: 2, h: 4, minW: 2, minH: 2 },
      { i: 'card3', x: 0, y: 8, w: 2, h: 4, minW: 2, minH: 2 },
      { i: 'card4', x: 0, y: 12, w: 2, h: 5, minW: 2, minH: 3 },
      { i: 'card5', x: 0, y: 17, w: 2, h: 5, minW: 2, minH: 3 },
    ]
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Update layouts to include/remove static property based on edit mode
  useEffect(() => {
    const updatedLayouts = Object.keys(layouts).reduce((acc: any, key: string) => {
      acc[key] = (layouts as any)[key].map((item: any) => ({
        ...item,
        static: !isEditMode
      }));
      return acc;
    }, {});
    setLayouts(updatedLayouts);
  }, [isEditMode]);

  const handleLayoutChange = (layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    console.log('Layout changed:', allLayouts);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragStop = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };

  // Add CSS for smooth animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .react-grid-item {
        transition: all 200ms ease;
        transition-property: left, top, width, height;
      }
      .react-grid-item.cssTransforms {
        transition-property: transform, width, height;
      }
      .react-grid-item.resizing {
        transition: none;
        z-index: 1;
      }
      .react-grid-item.react-draggable-dragging {
        transition: none;
        z-index: 3;
        will-change: transform;
      }
      .react-grid-item > .react-resizable-handle {
        position: absolute;
        width: 20px;
        height: 20px;
      }
      .drag-handle {
        user-select: none;
      }
      .drag-handle:hover {
        background-color: #e5e7eb !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const cardData = [
    { id: 'card1', title: 'Revenue', value: '$125,430', change: '+12.5%', color: 'green' },
    { id: 'card2', title: 'Active Users', value: '8,432', change: '+5.2%', color: 'blue' },
    { id: 'card3', title: 'Orders', value: '1,234', change: '-2.1%', color: 'red' },
    { id: 'card4', title: 'Performance Chart', type: 'chart' },
    { id: 'card5', title: 'Recent Activity', type: 'activity' },
  ];

  const renderCard = (card: any) => {
    if (card.type === 'chart') {
      return (
        <Card className="h-full overflow-hidden">
          {isEditMode && (
            <div className="drag-handle bg-gray-50 hover:bg-gray-100 cursor-move p-2 border-b flex items-center">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 2a1 1 0 011 1v1a1 1 0 11-2 0V5a1 1 0 011-1zm-1 4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1zm1 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Drag to move</span>
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-bold mb-3">{card.title}</h3>
            <div className="h-32 flex items-center justify-center bg-gray-50 rounded">
              <span className="text-gray-400">Chart Placeholder</span>
            </div>
          </div>
        </Card>
      );
    }

    if (card.type === 'activity') {
      return (
        <Card className="h-full overflow-hidden">
          {isEditMode && (
            <div className="drag-handle bg-gray-50 hover:bg-gray-100 cursor-move p-2 border-b flex items-center">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 2a1 1 0 011 1v1a1 1 0 11-2 0V5a1 1 0 011-1zm-1 4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1zm1 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Drag to move</span>
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-bold mb-3">{card.title}</h3>
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded">User John logged in</div>
              <div className="p-2 bg-gray-50 rounded">Order #1234 completed</div>
              <div className="p-2 bg-gray-50 rounded">New customer registered</div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="h-full overflow-hidden">
        {isEditMode && (
          <div className="drag-handle bg-gray-50 hover:bg-gray-100 cursor-move p-2 border-b flex items-center">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 2a1 1 0 011 1v1a1 1 0 11-2 0V5a1 1 0 011-1zm-1 4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1zm1 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Drag to move</span>
          </div>
        )}
        <div className="p-4">
          <h3 className="text-sm text-gray-600 uppercase tracking-wide">{card.title}</h3>
          <p className="text-2xl font-bold mt-1">{card.value}</p>
          <p className={`text-sm mt-2 font-medium ${
            card.color === 'green' ? 'text-green-600' : 
            card.color === 'red' ? 'text-red-600' : 'text-blue-600'
          }`}>
            {card.change}
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Grafana-Style Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded transition-all duration-200 ${
              isEditMode 
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {isEditMode ? '✓ Save Layout' : '✏️ Edit Layout'}
          </button>
        </div>
      </div>

      {isEditMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>📌 Edit Mode:</strong> Drag cards from the handle to reposition. Drag corners/edges to resize. Cards will push others out of the way.
          </p>
        </div>
      )}

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={50}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onResizeStart={handleDragStart}
        onResizeStop={handleDragStop}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType={null}
        preventCollision={false}
        allowOverlap={false}
        verticalCompact={false}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        transformScale={1}
        draggableHandle={isEditMode ? '.drag-handle' : undefined}
      >
        {cardData.map((card) => (
          <div key={card.id} className={isDragging ? 'cursor-grabbing' : ''}>
            {renderCard(card)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

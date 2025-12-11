import { useState } from 'react';
import { Button } from '$app/components/forms';
import { DashboardRowContainer } from './DashboardRowContainer';
import {
  DashboardRowLayout,
  convertFlatLayoutToRows,
} from '../types/DashboardRowTypes';
import GridLayout from 'react-grid-layout';

// Sample flat layout to demonstrate conversion
const sampleFlatLayout: GridLayout.Layout[] = [
  { i: 'panel-1', x: 0, y: 0, w: 4, h: 200 },
  { i: 'panel-2', x: 4, y: 0, w: 4, h: 200 },
  { i: 'panel-3', x: 8, y: 0, w: 4, h: 200 },
  { i: 'panel-4', x: 0, y: 200, w: 6, h: 250 },
  { i: 'panel-5', x: 6, y: 200, w: 6, h: 250 },
  { i: 'panel-6', x: 0, y: 450, w: 12, h: 300 },
];

const initialLayout: DashboardRowLayout = {
  rows: convertFlatLayoutToRows(sampleFlatLayout),
};

const PANEL_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#6C5CE7',
];

export function DashboardRowDemo() {
  const [layout, setLayout] = useState<DashboardRowLayout>(initialLayout);
  const [isEditMode, setIsEditMode] = useState(true);
  const [breakpoint] = useState('lg');

  const renderPanel = (panelId: string) => {
    const panelIndex = parseInt(panelId.split('-')[1]) - 1;
    const color = PANEL_COLORS[panelIndex % PANEL_COLORS.length];

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: color,
          border: '2px solid white',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
        }}
      >
        {isEditMode && (
          <div
            className="drag-handle"
            style={{
              padding: '8px 16px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              cursor: 'grab',
              marginBottom: '10px',
            }}
          >
            ⋮⋮
          </div>
        )}
        <div>{panelId}</div>
        <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>
          {isEditMode ? 'Drag/Resize Me' : 'View Mode'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', minHeight: '100vh' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '20px',
          background: '#2a2a2a',
          borderRadius: '8px',
        }}
      >
        <h1 style={{ color: 'white', fontSize: '24px', margin: 0 }}>
          Row-Based Dashboard Grid (Grafana Style)
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            type={isEditMode ? 'primary' : 'secondary'}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? '✓ Edit Mode' : 'View Mode'}
          </Button>
          <Button
            type="minimal"
            onClick={() => {
              console.log('Current Layout:', JSON.stringify(layout, null, 2));
              alert('Layout logged to console');
            }}
          >
            Log Layout
          </Button>
        </div>
      </div>

      <div style={{ color: 'white', marginBottom: '20px', padding: '15px' }}>
        <h3>Features:</h3>
        <ul>
          <li>✓ Panels grouped into rows (implicit containers)</li>
          <li>✓ All panels in a row share the same height</li>
          <li>✓ Drag panels horizontally within rows</li>
          <li>✓ Resize panels horizontally (width only)</li>
          <li>✓ Resize entire row vertically (affects all panels in row)</li>
          <li>✓ Drag rows up/down to reorder</li>
          <li>✓ Add new rows with {String.fromCharCode(34)}+ Add Row{String.fromCharCode(34)} button</li>
          <li>✓ Delete individual rows</li>
        </ul>
      </div>

      <DashboardRowContainer
        layout={layout}
        breakpoint={breakpoint}
        isEditMode={isEditMode}
        onLayoutChange={setLayout}
        renderPanel={renderPanel}
        cols={{
          xxl: 12,
          xl: 12,
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12,
          xxs: 12,
        }}
      />
    </div>
  );
}

# Row-Based Dashboard Grid Implementation (Grafana-Style)

## Overview

Implemented a new row-based dashboard grid system that mirrors Grafana's approach, where:
- Panels are grouped into **explicit row containers**
- All panels in a row **share the same height** (derived from row height)
- **Row height is locked** during horizontal dragging/resizing
- Only **row-level resize handles** can change vertical height
- Panels can only be resized **horizontally** within rows

## Architecture

### Key Components Created

1. **`DashboardRowTypes.ts`** - Type definitions and conversion utilities
   - `DashboardRow` - Row container with height and panels
   - `DashboardRowPanel` - Panel without y/h (inherits from row)
   - `DashboardRowLayout` - Layout organized by rows
   - `convertFlatLayoutToRows()` - Converts old flat layouts to row-based
   - `convertRowsToFlatLayout()` - Converts back to flat for backwards compat

2. **`DashboardRow.tsx`** - Individual row component
   - Renders panels within a row using `react-grid-layout`
   - All panels constrained to y=0 within row context
   - Horizontal-only resize handles for panels (`e`, `w`)
   - Row-level vertical resize handle at bottom
   - Panels auto-stretch to fill row height

3. **`DashboardRowContainer.tsx`** - Manages multiple rows
   - Vertical stacking of rows
   - Row drag-and-drop reordering
   - Add/delete row functionality
   - Recalculates Y positions when rows change

4. **`DashboardRowDemo.tsx`** - Standalone demo/proof-of-concept
   - Accessible at `/dashboard-row-demo` route
   - Shows 6 colored panels in 3 rows
   - Demonstrates all features interactively

## How It Works

### Row Height Locking

```typescript
// Within DashboardRow.tsx
const panelLayout: GridLayout.Layout[] = row.panels.map((panel) => ({
  i: panel.i,
  x: panel.x,
  y: 0,          // Always 0 within row
  w: panel.w,
  h: row.h,      // ALL panels inherit row height
  // ...
}));
```

### Resize Behavior

- **Horizontal panel resize**: Updates panel width only
- **Row vertical resize**: Updates `row.h`, all panels automatically adjust
- **React-grid-layout config**:
  ```typescript
  resizeHandles={['e', 'w']}  // Only horizontal for panels
  compactType={null}          // No auto-compaction
  preventCollision={false}    // Allow rearranging
  ```

### Conversion from Flat Layouts

```typescript
// Groups panels by Y position (with 5-unit tolerance)
const rows = convertFlatLayoutToRows(flatLayout);

// Example:
// Flat: [{ i: '1', x: 0, y: 0, w: 4, h: 200 }, { i: '2', x: 4, y: 0, w: 4, h: 200 }]
// Rows: [{ id: 'row-0', y: 0, h: 200, panels: [{ i: '1', x: 0, w: 4 }, { i: '2', x: 4, w: 4 }] }]
```

## Features Implemented

✅ **Row-based architecture** - Panels grouped into row containers
✅ **Height stability** - Row height doesn't change during horizontal operations
✅ **Horizontal drag/resize** - Panels can be rearranged and resized within rows
✅ **Row-level vertical resize** - Dedicated handle at bottom of each row
✅ **Row reordering** - Drag entire rows up/down
✅ **Add/Delete rows** - "+ Add Row" button and per-row delete button
✅ **Window resize handling** - Responsive breakpoints preserved
✅ **Edit mode toggle** - Clean view mode vs edit mode

## Testing the Demo

1. Navigate to `/dashboard-row-demo` after starting the dev server
2. Toggle "Edit Mode" on (enabled by default)
3. Try these actions:
   - **Drag panels horizontally** within a row (using drag handle ⋮⋮)
   - **Resize panels** horizontally (grab left/right edges)
   - **Resize row height** (grab handle at bottom of row)
   - **Drag entire rows** (grab anywhere on row container)
   - **Add new row** ("+ Add Row" button at bottom)
   - **Delete row** ("Delete Row" button in top-right of each row)

## Next Steps to Integrate

### Integration with `ResizableDashboardCards.tsx`

1. **Replace layouts state**:
   ```typescript
   // OLD
   const [layouts, setLayouts] = useState<DashboardGridLayouts>(initialLayouts);
   
   // NEW
   const [rowLayouts, setRowLayouts] = useState<{ [bp: string]: DashboardRowLayout }>({
     lg: { rows: convertFlatLayoutToRows(initialLayouts.lg) },
     // ... for each breakpoint
   });
   ```

2. **Update save/load logic**:
   ```typescript
   // When saving
   const savedLayout = convertRowsToFlatLayout(rowLayouts[breakpoint].rows);
   
   // When loading
   const loadedRows = convertFlatLayoutToRows(savedLayout);
   ```

3. **Replace ResponsiveGridLayout** with `DashboardRowContainer`:
   ```typescript
   <DashboardRowContainer
     layout={rowLayouts[breakpoint]}
     breakpoint={breakpoint}
     isEditMode={isEditMode}
     onLayoutChange={(newLayout) => {
       setRowLayouts(prev => ({ ...prev, [breakpoint]: newLayout }));
     }}
     renderPanel={(panelId) => {
       // Return the panel component (Chart, Activity, etc.)
     }}
     cols={cols}
   />
   ```

4. **Convert `initialLayouts`** to row-based on mount:
   ```typescript
   useEffect(() => {
     const convertedLayouts = Object.entries(initialLayouts).reduce((acc, [bp, layout]) => {
       acc[bp] = { rows: convertFlatLayoutToRows(layout) };
       return acc;
     }, {} as { [bp: string]: DashboardRowLayout });
     
     setRowLayouts(convertedLayouts);
   }, []);
   ```

## Benefits

1. **No more chaotic vertical spacing** - Row height is explicit and stable
2. **Predictable drag behavior** - Can't accidentally change row heights
3. **Grafana-like UX** - Users familiar with Grafana will feel at home
4. **Cleaner mental model** - "Rows of panels" vs "grid of panels"
5. **Better responsive behavior** - Rows collapse predictably on mobile

## Technical Details

### Row Container Props

```typescript
interface DashboardRowContainerProps {
  layout: DashboardRowLayout;           // Current row-based layout
  breakpoint: string;                   // Current breakpoint (lg, md, etc.)
  isEditMode: boolean;                  // Whether editing is enabled
  onLayoutChange: (newLayout) => void;  // Callback when layout changes
  renderPanel: (panelId: string) => ReactNode; // Function to render each panel
  cols: { [key: string]: number };      // Column count per breakpoint
}
```

### Row Data Structure

```typescript
interface DashboardRow {
  id: string;           // Unique row identifier
  y: number;            // Vertical position of row
  h: number;            // Height of row (all panels inherit)
  panels: DashboardRowPanel[]; // Panels within this row
  minH?: number;
  maxH?: number;
}

interface DashboardRowPanel {
  i: string;            // Panel ID
  x: number;            // Horizontal position
  w: number;            // Width
  minW?: number;
  maxW?: number;
  static?: boolean;
}
```

## Files Created

- `src/pages/dashboard/types/DashboardRowTypes.ts` (144 lines)
- `src/pages/dashboard/components/DashboardRow.tsx` (159 lines)
- `src/pages/dashboard/components/DashboardRowContainer.tsx` (235 lines)
- `src/pages/dashboard/components/DashboardRowDemo.tsx` (155 lines)
- `src/common/routes.tsx` (modified - added demo route)

## Build Status

✅ **TypeScript compilation**: Clean, no errors
✅ **Vite build**: Successful
✅ **Dependencies**: All satisfied (uses existing react-grid-layout)

## Ready for Testing

The row-based system is now ready to test at `/dashboard-row-demo`. Once validated, we can proceed with full integration into `ResizableDashboardCards.tsx`.

# Reports Preview Component - Advanced Sorting Improvements

## Overview
The reports preview component has been enhanced with advanced sorting capabilities to provide better data organization and analysis options. The previous basic sorting implementation has been replaced with a comprehensive sorting system that includes natural sorting, multi-column sorting, and intelligent data type detection.

## Key Improvements

### 1. Natural Sorting Algorithm
- **Problem Solved**: Previously, alphanumeric strings would sort incorrectly (e.g., "item1", "item10", "item2" would appear as "item1", "item10", "item2")
- **Solution**: Implemented natural sorting that correctly handles mixed alphanumeric content
- **Example**: "Invoice-1", "Invoice-2", "Invoice-10" now sort correctly as 1, 2, 10 instead of 1, 10, 2

### 2. Intelligent Data Type Detection
The system now automatically detects and applies appropriate sorting algorithms based on column content:

- **Numeric columns**: Detected by column names ending with `.amount`, `.balance`, `.quantity`, etc.
- **Date columns**: Detected by keywords like `date`, `_at`, `created`, `updated`
- **Currency values**: Detected by currency symbols ($, €, £, ¥)
- **Boolean values**: Detected by true/false values
- **Natural text**: Applied when alphanumeric content is detected
- **Case-insensitive text**: Default fallback for pure text content

### 3. Multi-Column Sorting
- **Feature**: Sort by multiple columns with priority ordering
- **Usage**: Hold Shift while clicking column headers to add secondary sort columns
- **Visual indicators**: Shows sort direction (↑/↓) and priority number (1, 2, 3...)
- **Clear individual sorts**: Click the × button next to each sort indicator

### 4. Advanced Sort Types

#### Natural Sort
```typescript
// Handles: "Invoice-1", "Invoice-10", "Invoice-2"
// Result: "Invoice-1", "Invoice-2", "Invoice-10"
```

#### Numeric Sort
```typescript
// Handles: "1,234.56", "$2,500", "€1.500,00"
// Strips formatting and sorts numerically
```

#### Date Sort
```typescript
// Handles various date formats
// Converts to timestamps for accurate comparison
```

#### Currency Sort
```typescript
// Handles: "$1,234", "€500", "£2,000"
// Removes currency symbols and formats before sorting
```

#### Boolean Sort
```typescript
// Groups false values before true values (or vice versa)
```

### 5. Grouping Support (Optional)
- **Feature**: Group rows by a specific column value
- **Usage**: Select a column from the grouping dropdown
- **Display**: Shows group headers with item counts

## Implementation Files

### New Files Created
1. **`/root/ui/src/pages/reports/common/utils/sortingUtils.ts`**
   - Core sorting algorithms and utilities
   - Natural sorting implementation
   - Data type detection logic
   - Multi-column sort support

2. **`/root/ui/src/pages/reports/common/components/EnhancedPreview.tsx`**
   - Enhanced preview component with all new sorting features
   - Multi-column sort UI
   - Grouping support
   - Visual sort indicators

## Usage Examples

### Basic Usage (Replace existing Preview)
```tsx
import { EnhancedPreview } from './components/EnhancedPreview';

// In your component
<EnhancedPreview />
```

### With Custom Options
```tsx
<EnhancedPreview 
  enableMultiSort={true}      // Allow multi-column sorting
  enableNaturalSort={true}    // Use natural sorting algorithm
  enableGrouping={false}      // Disable grouping feature
/>
```

### Programmatic Sorting
```typescript
import { sortRows, SortConfig } from '../utils/sortingUtils';

const sortConfigs: SortConfig[] = [
  { column: 'invoice.number', direction: 'asc', sortType: 'natural' },
  { column: 'invoice.amount', direction: 'desc', sortType: 'numeric' }
];

const sortedRows = sortRows(rows, sortConfigs);
```

## Features Comparison

| Feature | Old Implementation | New Implementation |
|---------|-------------------|-------------------|
| Basic sorting | ✓ (alphabetical only) | ✓ (multiple algorithms) |
| Natural sorting | ✗ | ✓ |
| Multi-column sort | ✗ | ✓ |
| Data type detection | ✗ | ✓ |
| Currency handling | ✗ | ✓ |
| Date sorting | ✗ | ✓ |
| Case sensitivity options | ✗ | ✓ |
| Sort indicators | Basic | Advanced with priority |
| Grouping | ✗ | ✓ (optional) |
| Locale-aware sorting | ✗ | ✓ |

## Migration Guide

### Option 1: Direct Replacement
Replace imports in files using the Preview component:

```tsx
// Old
import { Preview } from './components/Preview';

// New
import { EnhancedPreview as Preview } from './components/EnhancedPreview';
```

### Option 2: Gradual Migration
Use the new component alongside the old one during transition:

```tsx
import { Preview } from './components/Preview';
import { EnhancedPreview } from './components/EnhancedPreview';

// Use based on feature flag or user preference
const PreviewComponent = useFeatureFlag('enhanced-sorting') 
  ? EnhancedPreview 
  : Preview;
```

## Performance Considerations

1. **Sorting Algorithm Complexity**: O(n log n) for most cases
2. **Natural Sort**: Slightly slower than basic sort but provides better UX
3. **Multi-column Sort**: Performance scales linearly with number of sort columns
4. **Large Datasets**: Consider implementing virtual scrolling for datasets > 10,000 rows

## Testing Recommendations

1. **Test with various data types**:
   - Mixed alphanumeric (Invoice-1, Invoice-10)
   - Currency values with different symbols
   - Dates in different formats
   - Boolean values
   - Empty/null values

2. **Test multi-column sorting**:
   - Primary + secondary sort
   - Removing individual sort columns
   - Clearing all sorts

3. **Test edge cases**:
   - Very large numbers
   - Special characters
   - Unicode/international characters
   - Mixed data types in same column

## Future Enhancements

1. **Custom Sort Functions**: Allow users to define custom sort logic
2. **Sort Presets**: Save and load common sort configurations
3. **Advanced Filtering**: Combine with complex filter expressions
4. **Export Options**: Maintain sort order in exported files
5. **Virtual Scrolling**: For very large datasets
6. **Sort Animations**: Visual feedback during sort operations

## Support

For questions or issues with the new sorting functionality, please:
1. Check the inline documentation in `sortingUtils.ts`
2. Review test cases for usage examples
3. Contact the development team with specific use cases

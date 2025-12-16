/**
 * Example Integration - How to use the Enhanced Preview Component
 * 
 * This file demonstrates how to integrate the new sorting capabilities
 * into the existing reports infrastructure.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { previewAtom } from './Preview';
import { EnhancedPreview } from './EnhancedPreview';

/**
 * Example 1: Drop-in Replacement for the existing Preview component
 * 
 * Simply replace the import in Reports.tsx:
 * 
 * OLD:
 * import { Preview } from '../common/components/Preview';
 * 
 * NEW:
 * import { EnhancedPreview as Preview } from '../common/components/EnhancedPreview';
 */

export function Example1() {
  const [preview] = useAtom(previewAtom);
  
  return (
    <div>
      {preview && <EnhancedPreview />}
    </div>
  );
}

/**
 * Example 2: Using with configuration options
 * 
 * You can customize the behavior of the enhanced preview:
 */
export function Example2() {
  const [preview] = useAtom(previewAtom);
  
  return (
    <div>
      {preview && (
        <EnhancedPreview 
          enableMultiSort={true}      // Allow sorting by multiple columns (Shift+Click)
          enableNaturalSort={true}    // Use natural sorting for alphanumeric content
          enableGrouping={false}      // Disable grouping feature for simplicity
        />
      )}
    </div>
  );
}

/**
 * Example 3: Programmatic sorting with the utilities
 * 
 * Use the sorting utilities directly in your code:
 */
import { sortRows, SortConfig, detectSortType } from '../utils/sortingUtils';
import { Cell } from './Preview';

export function Example3() {
  const [data, setData] = useState<Cell[][]>([]);
  const [t] = useTranslation();
  
  const sortData = () => {
    // Define sort configurations
    const sortConfigs: SortConfig[] = [
      // Primary sort: Invoice number using natural sort
      { 
        column: 'invoice.number', 
        direction: 'asc', 
        sortType: 'natural'  // Handles Invoice-1, Invoice-10, Invoice-2 correctly
      },
      // Secondary sort: Amount in descending order
      { 
        column: 'invoice.amount', 
        direction: 'desc', 
        sortType: 'numeric'  // Handles currency values
      },
      // Tertiary sort: Date
      { 
        column: 'invoice.date', 
        direction: 'desc', 
        sortType: 'date'  // Parses various date formats
      }
    ];
    
    const sortedData = sortRows(data, sortConfigs);
    setData(sortedData);
  };
  
  return (
    <div>
      <button onClick={sortData}>
        {t('sort')} {t('data')}
      </button>
    </div>
  );
}

/**
 * Example 4: Custom sort type detection
 * 
 * The system automatically detects data types, but you can override:
 */
export function Example4() {
  const detectAndSort = (column: string, sampleValue: any) => {
    // Automatic detection
    const detectedType = detectSortType(column, sampleValue);
    
    console.log(`Column: ${column}, Detected Type: ${detectedType}`);
    // Examples:
    // 'invoice.amount' -> 'numeric'
    // 'client.created_at' -> 'date'
    // 'Invoice-123' -> 'natural'
    // '$1,234.56' -> 'currency'
    // 'true' -> 'boolean'
    // 'John Doe' -> 'case-insensitive'
  };
  
  return null;
}

/**
 * Example 5: Grouping data by column
 */
import { groupRows } from '../utils/sortingUtils';

export function Example5() {
  const [data] = useState<Cell[][]>([]);
  
  const groupByClient = () => {
    const groups = groupRows(data, 'client.name');
    
    // groups is a Map where keys are client names and values are arrays of rows
    groups.forEach((rows, clientName) => {
      console.log(`Client: ${clientName}, Invoices: ${rows.length}`);
    });
    
    return groups;
  };
  
  return null;
}

/**
 * Example 6: Locale-aware sorting for international characters
 */
import { localeCompare } from '../utils/sortingUtils';

export function Example6() {
  const sortInternational = () => {
    const names = ['Žiga', 'Črt', 'Štefan', 'Ana'];
    
    // Sort with Slovenian locale
    const sorted = names.sort((a, b) => 
      localeCompare(a, b, 'sl', { sensitivity: 'base' })
    );
    
    console.log(sorted); // Correctly sorted for Slovenian
  };
  
  return null;
}

/**
 * Integration Guide for Reports.tsx
 * 
 * To integrate into the main Reports component:
 * 
 * 1. Import the enhanced preview:
 *    import { EnhancedPreview } from '../common/components/EnhancedPreview';
 * 
 * 2. Replace the Preview usage (around line 858):
 *    OLD: {preview && <Preview />}
 *    NEW: {preview && <EnhancedPreview enableMultiSort={true} />}
 * 
 * 3. The enhanced preview will automatically:
 *    - Detect data types in columns
 *    - Apply appropriate sorting algorithms
 *    - Show visual indicators for sort order
 *    - Support multi-column sorting with Shift+Click
 *    - Handle currency, dates, and alphanumeric content correctly
 * 
 * 4. No changes needed to the data structure or preview atom
 *    The enhanced preview is fully backward compatible
 */

export default function IntegrationGuide() {
  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-lg font-bold mb-2">Enhanced Report Preview - Integration Guide</h2>
      <p className="mb-4">
        The enhanced preview component provides advanced sorting capabilities while maintaining
        full backward compatibility with the existing reports infrastructure.
      </p>
      
      <h3 className="font-semibold mb-2">Key Features:</h3>
      <ul className="list-disc list-inside mb-4">
        <li>Natural sorting for alphanumeric content (Invoice-1, Invoice-10, Invoice-2)</li>
        <li>Automatic data type detection (numeric, date, currency, boolean, text)</li>
        <li>Multi-column sorting with priority indicators</li>
        <li>Visual sort direction indicators (↑/↓)</li>
        <li>Click to remove individual sort columns</li>
        <li>Shift+Click for multi-column sorting</li>
        <li>Currency formatting support ($1,234.56, €1.234,56)</li>
        <li>Date parsing for various formats</li>
        <li>Case-insensitive and case-sensitive options</li>
        <li>Optional data grouping by column values</li>
      </ul>
      
      <h3 className="font-semibold mb-2">Implementation:</h3>
      <code className="block bg-white p-2 rounded">
        {`// In Reports.tsx, replace:
{preview && <Preview />}

// With:
{preview && <EnhancedPreview enableMultiSort={true} />}`}
      </code>
    </div>
  );
}

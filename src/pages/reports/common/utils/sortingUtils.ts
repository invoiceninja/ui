import { Cell } from '../components/Preview';
import { numberFormattableColumns } from '../constants/columns';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  column: string;
  direction: SortDirection;
  sortType?: SortType;
}

export type SortType = 
  | 'natural'
  | 'numeric'
  | 'date'
  | 'boolean'
  | 'currency'
  | 'case-sensitive'
  | 'case-insensitive';

function naturalCompare(a: string, b: string): number {
  const ax: (string | number)[] = [];
  const bx: (string | number)[] = [];
  
  a.replace(/(\d+)|(\D+)/g, (_, arg1, arg2) => {
    ax.push(arg1 ? parseInt(arg1, 10) : arg2);
    return '';
  });
  
  b.replace(/(\d+)|(\D+)/g, (_, arg1, arg2) => {
    bx.push(arg1 ? parseInt(arg1, 10) : arg2);
    return '';
  });
  
  for (let i = 0; i < Math.max(ax.length, bx.length); i++) {
    const aVal = ax[i];
    const bVal = bx[i];
    
    if (aVal === undefined) return -1;
    if (bVal === undefined) return 1;
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      if (aVal !== bVal) return aVal - bVal;
    } else {
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (strA !== strB) return strA < strB ? -1 : 1;
    }
  }
  
  return 0;
}

function extractDisplayValue(cell: Cell): string | number {
  const { display_value } = cell;
  
  if (typeof display_value === 'number') {
    return display_value;
  }
  
  if (typeof display_value === 'string') {
    return display_value;
  }
  
  if (typeof display_value === 'object' && display_value !== null) {
    if ('props' in display_value && display_value.props?.children) {
      return String(display_value.props.children);
    }
  }
  
  return String(display_value);
}

function parseDateValue(value: string | number): number {
  if (typeof value === 'number') return value;
  
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }
  
  return new Date(0).getTime();
}

function parseNumericValue(value: string | number): number {
  if (typeof value === 'number') return value;
  
  const cleaned = String(value)
    .replace(/[\$\u20AC\u00A3\u00A5,]/g, '')
    .replace(/\s/g, '')
    .trim();
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function detectSortType(column: string, sampleValue: string | number): SortType {
  if (numberFormattableColumns.some(col => column.endsWith(col))) {
    return 'numeric';
  }
  
  if (column.includes('date') || column.includes('_at') || column.includes('created') || column.includes('updated')) {
    return 'date';
  }
  
  if (sampleValue === 'true' || sampleValue === 'false') {
    return 'boolean';
  }
  
  if (typeof sampleValue === 'string' && /^[\$\u20AC\u00A3\u00A5]/.test(sampleValue)) {
    return 'currency';
  }
  
  if (typeof sampleValue === 'string' && /\d/.test(sampleValue)) {
    return 'natural';
  }
  
  return 'case-insensitive';
}

export function compareValues(
  a: string | number,
  b: string | number,
  sortType: SortType = 'case-insensitive',
  direction: SortDirection = 'asc'
): number {
  let result = 0;
  
  switch (sortType) {
    case 'natural':
      result = naturalCompare(String(a), String(b));
      break;
      
    case 'numeric':
    case 'currency':
      result = parseNumericValue(a) - parseNumericValue(b);
      break;
      
    case 'date':
      result = parseDateValue(a) - parseDateValue(b);
      break;
      
    case 'boolean':
      const aBool = String(a).toLowerCase() === 'true' ? 1 : 0;
      const bBool = String(b).toLowerCase() === 'true' ? 1 : 0;
      result = aBool - bBool;
      break;
      
    case 'case-sensitive':
      result = String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
      break;
      
    case 'case-insensitive':
    default:
      result = String(a).toLowerCase() < String(b).toLowerCase() ? -1 : 
               String(a).toLowerCase() > String(b).toLowerCase() ? 1 : 0;
      break;
  }
  
  return direction === 'desc' ? -result : result;
}

export function sortRows(
  rows: Cell[][],
  sortConfigs: SortConfig[]
): Cell[][] {
  if (sortConfigs.length === 0) return rows;
  
  return [...rows].sort((rowA, rowB) => {
    for (const config of sortConfigs) {
      const cellA = rowA.find(cell => cell.identifier === config.column);
      const cellB = rowB.find(cell => cell.identifier === config.column);
      
      if (!cellA || !cellB) continue;
      
      const valueA = extractDisplayValue(cellA);
      const valueB = extractDisplayValue(cellB);
      
      const sortType = config.sortType || detectSortType(config.column, valueA);
      
      const result = compareValues(valueA, valueB, sortType, config.direction);
      
      if (result !== 0) return result;
    }
    
    return 0;
  });
}

export function groupRows(
  rows: Cell[][],
  groupByColumn: string
): Map<string, Cell[][]> {
  const groups = new Map<string, Cell[][]>();
  
  rows.forEach(row => {
    const cell = row.find(c => c.identifier === groupByColumn);
    if (!cell) return;
    
    const key = String(extractDisplayValue(cell));
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });
  
  return groups;
}

export function localeCompare(
  a: string,
  b: string,
  locale: string = 'en',
  options?: Intl.CollatorOptions
): number {
  return a.localeCompare(b, locale, {
    numeric: true,
    sensitivity: 'base',
    ...options
  });
}

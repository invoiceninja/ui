/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type BlockType =
  | 'text'
  | 'image'
  | 'logo'
  | 'table'
  | 'tasks-table'
  | 'divider'
  | 'spacer'
  | 'total'
  | 'qrcode'
  | 'signature'
  | 'client-info'
  | 'company-info'
  | 'invoice-details';

export interface GridPosition {
  x: number; // Grid column (0-11 for 12-column grid)
  y: number; // Grid row
  w: number; // Width in columns
  h: number; // Height in rows
}

export interface Block {
  id: string;
  type: BlockType;
  gridPosition: GridPosition;
  properties: BlockProperties;
  locked?: boolean; // Prevent accidental editing/deletion
}

// Flexible property type that allows any properties with type hints
export type BlockProperties = Record<string, any>;

// Type hints for common block properties (not strict requirements)
export interface TextBlockPropertiesHint {
  content?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  color?: string;
  align?: string;
  fontStyle?: string;
  padding?: string;
}

export interface ImageBlockPropertiesHint {
  source?: string;
  align?: string;
  maxWidth?: string;
  objectFit?: string;
}

export interface LogoBlockPropertiesHint {
  source?: string;
  align?: string;
  maxWidth?: string;
  objectFit?: string;
}

export interface TableColumn {
  id: string;
  header: string;
  field: string;
  width: string;
  align: string;
}

export interface TableBlockPropertiesHint {
  columns?: TableColumn[];
  headerBg?: string;
  headerColor?: string;
  headerFontWeight?: string;
  rowBg?: string;
  alternateRowBg?: string;
  borderColor?: string;
  fontSize?: string;
  padding?: string;
  showBorders?: boolean;
  alternateRows?: boolean;
}

export interface DividerBlockPropertiesHint {
  thickness?: string;
  color?: string;
  style?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface SpacerBlockPropertiesHint {
  height?: string;
}

export interface TotalItem {
  label: string;
  field: string;
  show: boolean;
  isTotal?: boolean;
  isBalance?: boolean;
}

export interface TotalBlockPropertiesHint {
  items?: TotalItem[];
  fontSize?: string;
  align?: string;
  labelColor?: string;
  amountColor?: string;
  totalFontSize?: string;
  totalFontWeight?: string;
  totalColor?: string;
  balanceColor?: string;
  spacing?: string;
  labelPadding?: string;
  valuePadding?: string;
  labelValueGap?: string;
  valueMinWidth?: string;
  showLabels?: boolean;
}

export interface QRCodeBlockPropertiesHint {
  data?: string;
  size?: string;
  align?: string;
}

export interface SignatureBlockPropertiesHint {
  label?: string;
  showLine?: boolean;
  showDate?: boolean;
  align?: string;
  fontSize?: string;
  color?: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  variable: string;
  prefix?: string;
  suffix?: string;
  hideIfEmpty?: boolean;
}

export interface ClientInfoBlockPropertiesHint {
  content?: string; // Legacy format
  fieldConfigs?: FieldConfig[];
  fontSize?: string;
  lineHeight?: string;
  align?: string;
  color?: string;
  showTitle?: boolean;
  title?: string;
  titleFontWeight?: string;
}

export interface CompanyInfoBlockPropertiesHint {
  content?: string; // Legacy format
  fieldConfigs?: FieldConfig[];
  fontSize?: string;
  lineHeight?: string;
  align?: string;
  color?: string;
}

export interface InvoiceDetailsBlockPropertiesHint {
  content?: string;
  fontSize?: string;
  lineHeight?: string;
  align?: string;
  color?: string;
  labelColor?: string;
  showLabels?: boolean;
}

export interface LayoutConfig {
  cols: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding?: [number, number];
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category: 'modern' | 'classic' | 'minimal' | 'creative' | 'blank';
  blocks: Block[];
  layout: LayoutConfig;
  previewImages?: string[];
  tags?: string[];
}

export type BlockCategory = 'branding' | 'content' | 'data' | 'layout';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: ReactNode;
  description: string;
  defaultSize: { w: number; h: number };
  defaultProperties: BlockProperties;
  category: BlockCategory;
  essential?: boolean; // Mark as required/recommended block
}

export interface Variable {
  key: string;
  label: string;
  example: string;
  category: string;
}

export interface VariableGroup {
  label: string;
  icon?: ReactNode;
  variables: Variable[];
}

// Builder state management
export interface BuilderState {
  blocks: Block[];
  selectedBlockId: string | null;
  history: BuilderHistoryEntry[];
  historyIndex: number;
  zoom: number;
  templateId?: string;
}

export interface BuilderHistoryEntry {
  blocks: Block[];
  timestamp: number;
  action: string;
}

// Property editor types
export interface PropertyEditorProps<T = Block> {
  block: T;
  onChange: (block: T) => void;
}

export interface PropertyPanelProps {
  block: Block;
  onChange: (block: Block) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function generateBlockId(type: string): string {
  return `${type}-${uuidv4()}`;
}

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

// Union type for all block properties
export type BlockProperties =
  | TextBlockProperties
  | ImageBlockProperties
  | LogoBlockProperties
  | TableBlockProperties
  | DividerBlockProperties
  | SpacerBlockProperties
  | TotalBlockProperties
  | QRCodeBlockProperties
  | SignatureBlockProperties
  | ClientInfoBlockProperties
  | CompanyInfoBlockProperties
  | InvoiceDetailsBlockProperties;

// Individual block property interfaces
export interface TextBlockProperties {
  content: string;
  fontSize: string;
  fontWeight:
    | 'normal'
    | 'bold'
    | 'lighter'
    | 'bolder'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  lineHeight: string;
  color: string;
  align: 'left' | 'center' | 'right' | 'justify';
}

export interface ImageBlockProperties {
  source: string;
  align: 'left' | 'center' | 'right';
  maxWidth: string;
  objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export interface LogoBlockProperties {
  source: string;
  align: 'left' | 'center' | 'right';
  maxWidth: string;
  objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export interface TableColumn {
  id: string;
  header: string;
  field: string;
  width: string;
  align: 'left' | 'center' | 'right';
}

export interface TableBlockProperties {
  columns: TableColumn[];
  headerBg: string;
  headerColor: string;
  headerFontWeight: string;
  rowBg: string;
  alternateRowBg: string;
  borderColor: string;
  fontSize: string;
  padding: string;
  showBorders: boolean;
  alternateRows: boolean;
}

export interface DividerBlockProperties {
  thickness: string;
  color: string;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  marginTop: string;
  marginBottom: string;
}

export interface SpacerBlockProperties {
  height: string;
}

export interface TotalItem {
  label: string;
  field: string;
  show: boolean;
  isTotal?: boolean;
  isBalance?: boolean;
}

export interface TotalBlockProperties {
  items: TotalItem[];
  fontSize: string;
  align: 'left' | 'center' | 'right';
  labelColor: string;
  amountColor: string;
  totalFontSize: string;
  totalFontWeight: string;
  totalColor: string;
  balanceColor: string;
  spacing: string;
  labelPadding: string;
  valuePadding: string;
  labelValueGap: string;
  valueMinWidth: string;
  showLabels: boolean;
}

export interface QRCodeBlockProperties {
  data: string;
  size: string;
  align: 'left' | 'center' | 'right';
}

export interface SignatureBlockProperties {
  label: string;
  showLine: boolean;
  showDate: boolean;
  align: 'left' | 'center' | 'right';
  fontSize: string;
  color: string;
}

export interface ClientInfoBlockProperties {
  content: string;
  fontSize: string;
  lineHeight: string;
  align: 'left' | 'center' | 'right';
  color: string;
  showTitle: boolean;
  title: string;
  titleFontWeight: string;
}

export interface CompanyInfoBlockProperties {
  content: string;
  fontSize: string;
  lineHeight: string;
  align: 'left' | 'center' | 'right';
  color: string;
}

export interface InvoiceDetailsBlockProperties {
  content: string;
  fontSize: string;
  lineHeight: string;
  align: 'left' | 'center' | 'right';
  color: string;
  labelColor: string;
  showLabels: boolean;
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

export interface BlockDefinition<T extends BlockProperties = BlockProperties> {
  type: BlockType;
  label: string;
  icon: ReactNode;
  description: string;
  defaultSize: { w: number; h: number };
  defaultProperties: T;
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

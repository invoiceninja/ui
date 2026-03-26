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
  properties: Record<string, any>;
  locked?: boolean; // Prevent accidental editing/deletion
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
  defaultProperties: Record<string, any>;
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

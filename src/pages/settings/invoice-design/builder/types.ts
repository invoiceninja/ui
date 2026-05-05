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
  | 'client-shipping-info'
  | 'company-info'
  | 'invoice-details'
  | 'public-notes'
  | 'footer'
  | 'terms';

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

/** Stored on table / tasks-table blocks (header vs body borders). */
export interface TableRegionBordersHint {
  color?: string;
  /** Pixel thickness 0–20 (integer); API may coerce string values when reading. */
  width?: number | string;
  sides?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

export interface TableBlockPropertiesHint {
  columns?: TableColumn[];
  headerBg?: string;
  headerColor?: string;
  headerFontWeight?: string;
  rowBg?: string;
  alternateRowBg?: string;
  fontSize?: string;
  padding?: string;
  showBorders?: boolean;
  /** Header row (`th`) border styling. */
  headerBorders?: TableRegionBordersHint;
  /** Body rows (`td`) border styling. */
  rowBorders?: TableRegionBordersHint;
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

/**
 * Per-cell typography. Used for label and value cells in the row-based
 * blocks (invoice-details, total). All fields are optional and fall back
 * to block-level defaults when unset.
 */
export interface CellTypography {
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
}

export interface TotalItem {
  label: string;
  field: string;
  show: boolean;
  isTotal?: boolean;
  isBalance?: boolean;
  labelStyle?: CellTypography;
  valueStyle?: CellTypography;
  // Legacy flat fields - kept readable for back-compat with existing
  // saved templates. New writes go to labelStyle / valueStyle.
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  fontStyle?: string;
  amountColor?: string;
}

export interface TotalBlockPropertiesHint {
  items?: TotalItem[];
  fontSize?: string;
  align?: string;
  labelAlign?: 'left' | 'center' | 'right';
  valueAlign?: 'left' | 'center' | 'right';
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
  /**
   * Page-break behaviour for the totals block.
   *  - `true`  → force a page break before the block (always start on a new page)
   *  - `false` → avoid breaking inside the block (keep it together on one page)
   *  - undefined → renderer default (no page-break rule emitted)
   */
  keepTogether?: boolean;
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
  labelStyle?: CellTypography;
  valueStyle?: CellTypography;
  // Legacy flat fields - kept readable for back-compat with existing
  // saved templates. New writes go to labelStyle / valueStyle.
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  fontStyle?: string;
}

export interface ClientInfoBlockPropertiesHint {
  fieldConfigs?: FieldConfig[];
  fontSize?: string;
  lineHeight?: string;
  align?: string;
  color?: string;
  showTitle?: boolean;
  title?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleFontStyle?: string;
  titleColor?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titlePrefix?: string;
  titleSuffix?: string;
}

/** Same shape as client-info; used for ship-to blocks with shipping-only fields. */
export type ClientShippingInfoBlockPropertiesHint =
  ClientInfoBlockPropertiesHint;

export interface CompanyInfoBlockPropertiesHint {
  fieldConfigs?: FieldConfig[];
  fontSize?: string;
  lineHeight?: string;
  align?: string;
  color?: string;
  showTitle?: boolean;
  title?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleFontStyle?: string;
  titleColor?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titlePrefix?: string;
  titleSuffix?: string;
}

export interface InvoiceDetailsBlockPropertiesHint {
  fieldConfigs?: FieldConfig[];
  fontSize?: string;
  lineHeight?: string;
  align?: string;
  color?: string;
  labelColor?: string;
  showLabels?: boolean;
  labelAlign?: 'left' | 'center' | 'right';
  valueAlign?: 'left' | 'center' | 'right';
  labelPadding?: string;
  valuePadding?: string;
  labelValueGap?: string;
  rowSpacing?: string;
  valueMinWidth?: string;
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
  description?: string;
  defaultSize: { w: number; h: number };
  defaultProperties: BlockProperties;
  category: BlockCategory;
  essential?: boolean;
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

/**
 * Per-template document-level settings. Initially seeded from company.settings
 * but stored on the template so designs can override company defaults.
 *
 * Canonical type lives in `$app/common/interfaces/design` so both the builder
 * and any non-builder consumer (preview, future PDF tooling) share one shape.
 */
export type { DocumentSettings } from '$app/common/interfaces/design';
import type { DocumentSettings } from '$app/common/interfaces/design';

interface CompanyDesignSettingsLike {
  page_layout?: string;
  page_size?: string;
  font_size?: number | string;
  primary_font?: string;
  secondary_font?: string;
  show_paid_stamp?: boolean;
  show_shipping_address?: boolean;
  embed_documents?: boolean;
  hide_empty_columns_on_pdf?: boolean;
  page_numbering?: boolean;
}

export function createDefaultDocumentSettings(
  companySettings?: CompanyDesignSettingsLike | null
): DocumentSettings {
  const fontSize = companySettings?.font_size;

  return {
    pageLayout:
      (companySettings?.page_layout as 'portrait' | 'landscape') || 'portrait',
    pageSize: companySettings?.page_size || 'A4',
    globalFontSize:
      typeof fontSize === 'string' ? parseInt(fontSize, 10) || 16 : fontSize || 16,
    primaryFont: companySettings?.primary_font || 'Roboto',
    secondaryFont: companySettings?.secondary_font || 'Roboto',
    showPaidStamp: Boolean(companySettings?.show_paid_stamp),
    showShippingAddress: Boolean(companySettings?.show_shipping_address),
    embedDocuments: Boolean(companySettings?.embed_documents),
    hideEmptyColumns: Boolean(companySettings?.hide_empty_columns_on_pdf),
    pageNumbering: Boolean(companySettings?.page_numbering),
    // Design-level only — not seeded from company.settings.
    pageMarginTop: 0,
    pageMarginRight: 0,
    pageMarginBottom: 0,
    pageMarginLeft: 0,
    pagePaddingTop: 30,
    pagePaddingRight: 30,
    pagePaddingBottom: 30,
    pagePaddingLeft: 30,
  };
}

// Builder state management
export interface BuilderState {
  blocks: Block[];
  selectedBlockId: string | null;
  history: BuilderHistoryEntry[];
  historyIndex: number;
  zoom: number;
  templateId?: string;
  documentSettings: DocumentSettings;
  /** Right-panel mode when no block is selected. */
  panelMode?: 'block' | 'document';
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

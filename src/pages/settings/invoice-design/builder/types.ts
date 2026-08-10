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
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetCssClassesHint {
  /** Optional whitespace-separated classes appended to the stable widget classes. */
  cssClasses?: string;
}

export interface TextBlockProperties extends WidgetCssClassesHint {
  content?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  color?: string;
  align?: string;
  fontStyle?: string;
  padding?: string;
}

export interface ImageBlockProperties extends WidgetCssClassesHint {
  source?: string;
  align?: string;
  maxWidth?: string;
  maxHeight?: string;
  objectFit?: string;
  padding?: string;
}

export interface LogoBlockProperties extends WidgetCssClassesHint {
  source?: string;
  align?: string;
  maxWidth?: string;
  maxHeight?: string;
  objectFit?: string;
  padding?: string;
}

export interface TableColumn {
  id: string;
  header: string;
  field: string;
  width: string;
  align: string;
}

export interface TableRegionBordersHint {
  color?: string;
  width?: number | string;
  sides?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

export interface TableBlockProperties extends WidgetCssClassesHint {
  columns?: TableColumn[];
  headerBg?: string;
  headerColor?: string;
  headerFontWeight?: string;
  rowBg?: string;
  alternateRowBg?: string;
  fontSize?: string;
  padding?: string;
  headerBorders?: TableRegionBordersHint;
  rowBorders?: TableRegionBordersHint;
  alternateRows?: boolean;
  rowColor?: string;
  showBorders?: boolean;
}

export interface DividerBlockProperties extends WidgetCssClassesHint {
  thickness?: string;
  color?: string;
  style?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface SpacerBlockProperties extends WidgetCssClassesHint {
  height?: string;
}

export interface CellTypography {
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
}

export interface TotalItem {
  label: string;
  field: string;
  show?: boolean;
  isTotal?: boolean;
  isBalance?: boolean;
  labelStyle?: CellTypography;
  valueStyle?: CellTypography;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  fontStyle?: string;
  amountColor?: string;
}

export interface TotalBlockProperties extends WidgetCssClassesHint {
  items?: TotalItem[];
  align?: string;
  labelAlign?: 'left' | 'center' | 'right';
  valueAlign?: 'left' | 'center' | 'right';
  spacing?: string;
  labelPadding?: string;
  valuePadding?: string;
  labelValueGap?: string;
  valueMinWidth?: string;
  showLabels?: boolean;
  keepTogether?: boolean;
  padding?: string;
}

export interface QRCodeBlockProperties extends WidgetCssClassesHint {
  data?: string;
  size?: string;
  align?: string;
  qrType?: string;
  content?: string;
}

export interface SignatureBlockProperties extends WidgetCssClassesHint {
  label?: string;
  showLine?: boolean;
  showDate?: boolean;
  align?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  signatureHeight?: string;
  lineWidth?: string;
  lineThickness?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineColor?: string;
  padding?: string;
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
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  fontStyle?: string;
}

export interface ClientInfoBlockProperties extends WidgetCssClassesHint {
  fieldConfigs?: FieldConfig[];
  content?: string;
  fontSize?: string;
  lineHeight?: string;
  align?: string;
  color?: string;
  padding?: string;
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

export type ClientShippingInfoBlockProperties = ClientInfoBlockProperties;

export interface CompanyInfoBlockProperties extends WidgetCssClassesHint {
  fieldConfigs?: FieldConfig[];
  content?: string;
  fontSize?: string;
  lineHeight?: string;
  align?: string;
  color?: string;
  padding?: string;
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

export interface InvoiceDetailsBlockProperties extends WidgetCssClassesHint {
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
  padding?: string;
}

export type PublicNotesBlockProperties = TextBlockProperties;
export type FooterBlockProperties = TextBlockProperties;
export type TermsBlockProperties = TextBlockProperties;
export type TasksTableBlockProperties = TableBlockProperties;

/** @deprecated Use *Properties types instead. */
export type TextBlockPropertiesHint = TextBlockProperties;
/** @deprecated Use *Properties types instead. */
export type ImageBlockPropertiesHint = ImageBlockProperties;
/** @deprecated Use *Properties types instead. */
export type LogoBlockPropertiesHint = LogoBlockProperties;
/** @deprecated Use *Properties types instead. */
export type TableBlockPropertiesHint = TableBlockProperties;
/** @deprecated Use *Properties types instead. */
export type DividerBlockPropertiesHint = DividerBlockProperties;
/** @deprecated Use *Properties types instead. */
export type SpacerBlockPropertiesHint = SpacerBlockProperties;
/** @deprecated Use *Properties types instead. */
export type TotalBlockPropertiesHint = TotalBlockProperties;
/** @deprecated Use *Properties types instead. */
export type QRCodeBlockPropertiesHint = QRCodeBlockProperties;
/** @deprecated Use *Properties types instead. */
export type SignatureBlockPropertiesHint = SignatureBlockProperties;
/** @deprecated Use *Properties types instead. */
export type ClientInfoBlockPropertiesHint = ClientInfoBlockProperties;
/** @deprecated Use *Properties types instead. */
export type ClientShippingInfoBlockPropertiesHint = ClientShippingInfoBlockProperties;
/** @deprecated Use *Properties types instead. */
export type CompanyInfoBlockPropertiesHint = CompanyInfoBlockProperties;
/** @deprecated Use *Properties types instead. */
export type InvoiceDetailsBlockPropertiesHint = InvoiceDetailsBlockProperties;

export interface BaseBlock {
  id: string;
  gridPosition: GridPosition;
  locked?: boolean;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  properties: TextBlockProperties;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  properties: ImageBlockProperties;
}

export interface LogoBlock extends BaseBlock {
  type: 'logo';
  properties: LogoBlockProperties;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  properties: TableBlockProperties;
}

export interface TasksTableBlock extends BaseBlock {
  type: 'tasks-table';
  properties: TasksTableBlockProperties;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  properties: DividerBlockProperties;
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  properties: SpacerBlockProperties;
}

export interface TotalBlock extends BaseBlock {
  type: 'total';
  properties: TotalBlockProperties;
}

export interface QRCodeBlock extends BaseBlock {
  type: 'qrcode';
  properties: QRCodeBlockProperties;
}

export interface SignatureBlock extends BaseBlock {
  type: 'signature';
  properties: SignatureBlockProperties;
}

export interface ClientInfoBlock extends BaseBlock {
  type: 'client-info';
  properties: ClientInfoBlockProperties;
}

export interface ClientShippingInfoBlock extends BaseBlock {
  type: 'client-shipping-info';
  properties: ClientShippingInfoBlockProperties;
}

export interface CompanyInfoBlock extends BaseBlock {
  type: 'company-info';
  properties: CompanyInfoBlockProperties;
}

export interface InvoiceDetailsBlock extends BaseBlock {
  type: 'invoice-details';
  properties: InvoiceDetailsBlockProperties;
}

export interface PublicNotesBlock extends BaseBlock {
  type: 'public-notes';
  properties: PublicNotesBlockProperties;
}

export interface FooterBlock extends BaseBlock {
  type: 'footer';
  properties: FooterBlockProperties;
}

export interface TermsBlock extends BaseBlock {
  type: 'terms';
  properties: TermsBlockProperties;
}

export type Block =
  | TextBlock
  | ImageBlock
  | LogoBlock
  | TableBlock
  | TasksTableBlock
  | DividerBlock
  | SpacerBlock
  | TotalBlock
  | QRCodeBlock
  | SignatureBlock
  | ClientInfoBlock
  | ClientShippingInfoBlock
  | CompanyInfoBlock
  | InvoiceDetailsBlock
  | PublicNotesBlock
  | FooterBlock
  | TermsBlock;

export type BlockProperties = Block['properties'];

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

export interface BuilderState {
  blocks: Block[];
  customCss: string;
  selectedBlockId: string | null;
  zoom: number;
  templateId?: string;
  documentSettings: DocumentSettings;
  panelMode?: 'block' | 'document' | 'css';
}

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

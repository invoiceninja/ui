/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface DocumentSettings {
  pageLayout: 'portrait' | 'landscape';
  pageSize: string;
  globalFontSize: number;
  primaryFont: string;
  secondaryFont: string;
  showPaidStamp: boolean;
  showShippingAddress: boolean;
  embedDocuments: boolean;
  hideEmptyColumns: boolean;
  pageNumbering: boolean;
  // Per-side page margin in px — drives @page { margin } in the rendered PDF.
  pageMarginTop: number;
  pageMarginRight: number;
  pageMarginBottom: number;
  pageMarginLeft: number;
  // Per-side inner content padding in px — drives .invoice-container padding.
  pagePaddingTop: number;
  pagePaddingRight: number;
  pagePaddingBottom: number;
  pagePaddingLeft: number;
}

export interface Parts {
  includes: string;
  header: string;
  body: string;
  product: string;
  task: string;
  footer: string;
  blocks?: any[];
  pageSettings?: Record<string, string>;
  documentSettings?: DocumentSettings;
}

export interface Design {
  id: string;
  is_custom: boolean;
  name: string;
  design: Parts;
  created_at: number;
  is_active: boolean;
  is_deleted: boolean;
  is_free: boolean;
  updated_at: number;
  is_template: boolean;
  entities: string;
}

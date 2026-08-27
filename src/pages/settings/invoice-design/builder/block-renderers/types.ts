/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Block } from '../types';
import { InvoiceData } from '../utils/variable-replacer';

/**
 * Resolved document-level globals threaded through every block renderer so the
 * inheritance cascade is `block.prop ?? globals.prop` everywhere.
 */
export interface GeneratorGlobals {
  fontSize: string; // '16px'
  fontFamilyPrimary: string; // 'Roboto, sans-serif'
  fontFamilySecondary: string; // 'Roboto, sans-serif'
  primaryColor: string;
  secondaryColor: string;
  showPaidStamp: boolean;
  /** Preview-only: expandable blocks render full content instead of scrolling. */
  fullDocument?: boolean;
}

export interface BlockRenderContext {
  block: Block;
  previewData?: InvoiceData;
  layoutData: InvoiceData;
  globals: GeneratorGlobals;
}

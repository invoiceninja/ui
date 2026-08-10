/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Design } from '$app/common/interfaces/design';
import { Block, DocumentSettings } from '../types';
import { wrapCustomCssForApi } from './custom-css';
import { GRID_CONFIG } from './grid-converter';
import { omitBlockLevelFontSizeWhenElementSized } from './grid/block-normalization';
import { repairGridPositionCollisions } from './grid/collisions';
import { BUILDER_GRID_VERSION } from './grid/types';
import { annotateBlocksWithRowLayout } from './row-layout';

/** Merge visual-builder output into the API `design` shape without wiping server fields. */
export function mergeDesignParts(
  blocks: Block[],
  htmlBody: string,
  previous: Design['design'] | undefined,
  documentSettings: DocumentSettings,
  customCss: string
): Design['design'] {
  // Annotate each block with row-layout hints (rowAlign, rowWidth, colStart,
  // colSpan) so the API can place blocks within their flex-row correctly —
  // the API otherwise loses `gridPosition.x` and packs every block left.
  const annotatedBlocks = annotateBlocksWithRowLayout(
    repairGridPositionCollisions(blocks).map(
      omitBlockLevelFontSizeWhenElementSized
    )
  );

  return {
    includes: previous?.includes ?? '',
    header: previous?.header ?? '',
    body: htmlBody,
    product: previous?.product ?? '',
    task: previous?.task ?? '',
    footer: previous?.footer ?? '',
    customCss: wrapCustomCssForApi(customCss),
    blocks: annotatedBlocks,
    documentSettings,
    builderGridVersion: BUILDER_GRID_VERSION,
    layout: {
      cols: GRID_CONFIG.cols,
      rowHeight: GRID_CONFIG.rowHeight,
      margin: GRID_CONFIG.margin,
      containerPadding: GRID_CONFIG.containerPadding,
    },
    ...(previous?.pageSettings ? { pageSettings: previous.pageSettings } : {}),
  } as Design['design'];
}

/**
 * Map per-template DocumentSettings (camelCase) → the snake_case shape that
 * `generateInvoiceHTML` consumes. This lets the generator stay agnostic of
 * whether values originated from company.settings or per-template overrides.
 */
export function documentSettingsToGeneratorShape(ds: DocumentSettings) {
  return {
    page_size: ds.pageSize,
    page_layout: ds.pageLayout,
    primary_font: ds.primaryFont,
    secondary_font: ds.secondaryFont,
    font_size: ds.globalFontSize,
    show_paid_stamp: ds.showPaidStamp,
    show_shipping_address: ds.showShippingAddress,
    embed_documents: ds.embedDocuments,
    hide_empty_columns: ds.hideEmptyColumns,
    page_numbering: ds.pageNumbering,
    page_margin_top: ds.pageMarginTop,
    page_margin_right: ds.pageMarginRight,
    page_margin_bottom: ds.pageMarginBottom,
    page_margin_left: ds.pageMarginLeft,
    page_padding_top: ds.pagePaddingTop,
    page_padding_right: ds.pagePaddingRight,
    page_padding_bottom: ds.pagePaddingBottom,
    page_padding_left: ds.pagePaddingLeft,
  };
}

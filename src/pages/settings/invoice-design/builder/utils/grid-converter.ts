/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Grid system constants (must match InvoiceBuilder.tsx)
 */
export const GRID_CONFIG = {
  cols: 12,
  rowHeight: 60, // pixels
  canvasWidth: 794, // pixels (210mm at 96dpi)
  margin: [10, 16] as [number, number], // [horizontal, vertical] in pixels - vertical is 1rem (16px)
  containerPadding: [30, 30] as [number, number], // [horizontal, vertical] in pixels
};

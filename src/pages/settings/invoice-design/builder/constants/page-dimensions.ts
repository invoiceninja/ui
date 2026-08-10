/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface PageDimensions {
  width: string;
  minHeight: string;
  pixels: number;
}

export interface GeneratorPageDimensions {
  width: number;
  height: number;
  widthMm: number;
  heightMm: number;
}

export const PAGE_SIZE_DIMENSIONS: Record<
  string,
  { widthMm: number; heightMm: number }
> = {
  A3: { widthMm: 297, heightMm: 420 },
  A4: { widthMm: 210, heightMm: 297 },
  A5: { widthMm: 148, heightMm: 210 },
  B4: { widthMm: 250, heightMm: 353 },
  B5: { widthMm: 176, heightMm: 250 },
  'JIS-B4': { widthMm: 257, heightMm: 364 },
  'JIS-B5': { widthMm: 182, heightMm: 257 },
  letter: { widthMm: 215.9, heightMm: 279.4 },
  legal: { widthMm: 215.9, heightMm: 355.6 },
  ledger: { widthMm: 279.4, heightMm: 431.8 },
};

export function getPageDimensions(
  pageSize: string = 'A4',
  layout: 'portrait' | 'landscape' = 'portrait'
): PageDimensions {
  const dims = PAGE_SIZE_DIMENSIONS[pageSize] || PAGE_SIZE_DIMENSIONS.A4;
  const widthMm = layout === 'landscape' ? dims.heightMm : dims.widthMm;
  const heightMm = layout === 'landscape' ? dims.widthMm : dims.heightMm;
  // 96dpi: 1mm ≈ 3.7795px
  return {
    width: `${widthMm}mm`,
    minHeight: `${heightMm}mm`,
    pixels: Math.round(widthMm * 3.7795),
  };
}

export function getGeneratorPageDimensions(
  pageSize: string = 'A4',
  layout: string = 'portrait'
): GeneratorPageDimensions {
  const dims = PAGE_SIZE_DIMENSIONS[pageSize] || PAGE_SIZE_DIMENSIONS.A4;
  const isLandscape = layout === 'landscape';
  const widthMm = isLandscape ? dims.heightMm : dims.widthMm;
  const heightMm = isLandscape ? dims.widthMm : dims.heightMm;

  return {
    width: Math.round(widthMm * 3.7795),
    height: Math.round(heightMm * 3.7795),
    widthMm,
    heightMm,
  };
}

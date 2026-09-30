/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GRID_CONFIG } from './grid-converter';
import type { DropGridContentInset } from './grid/sidebar-drop';
import { isChromeRegion, type BlockRegion } from './page-regions';

export interface ChromeDropTarget {
  element: HTMLElement;
  inset?: DropGridContentInset;
}

/** Padding on the inner chrome drop grid (matches PageChromeZone). */
export const CHROME_GRID_CONTENT_INSET: DropGridContentInset = {
  top: 0,
  left: GRID_CONFIG.containerPadding[0],
  right: GRID_CONFIG.containerPadding[0],
  bottom: 0,
};

export function resolveDropTarget(region: BlockRegion): ChromeDropTarget | null {
  if (region === 'body') {
    const element = document.querySelector<HTMLElement>(
      '.invoice-gridstack-grid'
    );

    return element ? { element } : null;
  }

  if (isChromeRegion(region)) {
    const element = document.querySelector<HTMLElement>(
      `[data-chrome-grid="${region}"]`
    );

    return element
      ? { element, inset: CHROME_GRID_CONTENT_INSET }
      : null;
  }

  return null;
}

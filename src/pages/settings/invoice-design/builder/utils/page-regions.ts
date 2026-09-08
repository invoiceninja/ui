/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { Block } from '../types';

export const PAGE_REGIONS = ['header', 'body', 'footer'] as const;
export type BlockRegion = (typeof PAGE_REGIONS)[number];

export const PAGINATION_MODES = ['none', 'header', 'footer', 'both'] as const;
export type PaginationMode = (typeof PAGINATION_MODES)[number];

export const DEFAULT_HEADER_HEIGHT = 100;
export const DEFAULT_FOOTER_HEIGHT = 100;
export const MIN_CHROME_HEIGHT = 24;
export const MAX_CHROME_HEIGHT = 400;

export function isBlockRegion(value: unknown): value is BlockRegion {
  return (
    typeof value === 'string' &&
    (PAGE_REGIONS as readonly string[]).includes(value)
  );
}

export function isPaginationMode(value: unknown): value is PaginationMode {
  return (
    typeof value === 'string' &&
    (PAGINATION_MODES as readonly string[]).includes(value)
  );
}

export function normalizeBlockRegion(value: unknown): BlockRegion {
  return isBlockRegion(value) ? value : 'body';
}

export function normalizePagination(value: unknown): PaginationMode {
  return isPaginationMode(value) ? value : 'none';
}

const CHROME_BACKGROUND_PATTERN =
  /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function normalizeChromeBackground(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  return CHROME_BACKGROUND_PATTERN.test(trimmed) ? trimmed : '';
}

export function clampChromeHeight(value: unknown, fallback: number): number {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseFloat(value)
        : Number.NaN;

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.max(MIN_CHROME_HEIGHT, Math.min(MAX_CHROME_HEIGHT, numeric));
}

export function blockRegion(block: Pick<Block, 'region'>): BlockRegion {
  return normalizeBlockRegion(block.region);
}

export function paginationIncludesHeader(mode: PaginationMode): boolean {
  return mode === 'header' || mode === 'both';
}

export function paginationIncludesFooter(mode: PaginationMode): boolean {
  return mode === 'footer' || mode === 'both';
}

/**
 * Canvas / PDF placement: a tagged chrome block only leaves the body stack
 * when that section is actually on. Header-only pagination keeps footer-tagged
 * widgets in the body.
 */
export function canvasRegionForBlock(
  block: Pick<Block, 'region'>,
  pagination: PaginationMode
): BlockRegion {
  const region = blockRegion(block);

  if (region === 'header' && paginationIncludesHeader(pagination)) {
    return 'header';
  }

  if (region === 'footer' && paginationIncludesFooter(pagination)) {
    return 'footer';
  }

  return 'body';
}

export function partitionBlocksByRegion<T extends Pick<Block, 'region'>>(
  blocks: T[],
  pagination: PaginationMode
): Record<BlockRegion, T[]> {
  const header: T[] = [];
  const body: T[] = [];
  const footer: T[] = [];

  blocks.forEach((block) => {
    const region = canvasRegionForBlock(block, pagination);

    if (region === 'header') {
      header.push(block);
    } else if (region === 'footer') {
      footer.push(block);
    } else {
      body.push(block);
    }
  });

  return { header, body, footer };
}

export const EXISTING_BLOCK_DRAG_TYPE = 'application/x-invoice-block-id';

export function pageRegionFromEventTarget(
  target: EventTarget | null
): BlockRegion {
  if (!(target instanceof Element)) {
    return 'body';
  }

  const regionElement = target.closest('[data-page-region]');
  const value = regionElement?.getAttribute('data-page-region');

  return normalizeBlockRegion(value);
}

export function pointInRect(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>
): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

/**
 * Hit-test page regions by geometry so GridStack's floating drag helper
 * (appended to document.body) does not steal the drop target.
 * Header/footer win when they overlap the body stage.
 */
export function regionFromClientPoint(
  clientX: number,
  clientY: number,
  zones: Array<{ region: BlockRegion; rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'> }>
): BlockRegion {
  let bodyHit: BlockRegion | null = null;

  for (const zone of zones) {
    if (!pointInRect(clientX, clientY, zone.rect)) {
      continue;
    }

    if (zone.region !== 'body') {
      return zone.region;
    }

    bodyHit = 'body';
  }

  return bodyHit ?? 'body';
}

export function pageRegionFromClientPoint(
  clientX: number,
  clientY: number
): BlockRegion {
  if (typeof document === 'undefined') {
    return 'body';
  }

  const zones = Array.from(
    document.querySelectorAll<HTMLElement>('[data-page-region]')
  ).map((element) => ({
    region: normalizeBlockRegion(element.getAttribute('data-page-region')),
    rect: element.getBoundingClientRect(),
  }));

  return regionFromClientPoint(clientX, clientY, zones);
}

export function clientPointFromEvent(
  event: Event | { clientX?: number; clientY?: number }
): { clientX: number; clientY: number } | null {
  if ('clientX' in event && typeof event.clientX === 'number') {
    return { clientX: event.clientX, clientY: Number(event.clientY) || 0 };
  }

  const native = event as Event;
  if ('changedTouches' in native) {
    const touch = (native as TouchEvent).changedTouches?.[0];

    if (touch) {
      return { clientX: touch.clientX, clientY: touch.clientY };
    }
  }

  return null;
}

export function assignBlockToRegion<T extends Block>(
  block: T,
  region: BlockRegion,
  gridPosition: T['gridPosition']
): T {
  return {
    ...block,
    region: region === 'body' ? undefined : region,
    gridPosition:
      region === 'body' ? gridPosition : { ...gridPosition, y: 0 },
  };
}

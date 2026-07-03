/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  PaginationLinks,
  PaginationMeta,
} from '$app/common/interfaces/generic-many-response';

export type PageNavigationAction =
  | 'first'
  | 'previous'
  | 'next'
  | 'last'
  | number;

export interface PageNavigationTarget {
  page: number;
  url: string | null;
}

export interface PageNavigationContext {
  currentPage: number;
  totalPages: number;
  pagination?: Partial<PaginationMeta> | null;
  requestUrl?: string;
}

export interface PageNavigationState {
  canPrevious: boolean;
  canNext: boolean;
}

const URL_BASE =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost';

export function getPaginationLinks(
  pagination?: Partial<PaginationMeta> | null
): PaginationLinks | undefined {
  const links = pagination?.links;

  if (!links || Array.isArray(links) || typeof links !== 'object') {
    return undefined;
  }

  const previous = links.previous?.length ? links.previous : undefined;
  const next = links.next?.length ? links.next : undefined;

  if (!previous && !next) {
    return undefined;
  }

  return { previous, next };
}

export function getPageParameter(url: string): number | null {
  try {
    const page = Number(new URL(url, URL_BASE).searchParams.get('page'));

    return Number.isInteger(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
}

export function replacePageParameter(url: string, page: number): string | null {
  try {
    const target = new URL(url, URL_BASE);

    target.searchParams.set('page', page.toString());

    return target.href;
  } catch {
    return null;
  }
}

export function resolvePageNavigation(
  action: PageNavigationAction,
  context: PageNavigationContext
): PageNavigationTarget | null {
  const { currentPage, requestUrl } = context;
  const totalPages = Math.max(context.totalPages, 1);

  if (action === 'previous' || action === 'next') {
    const links = getPaginationLinks(context.pagination);
    const link = links?.[action];

    if (link) {
      const page = getPageParameter(link);

      if (page !== null) {
        return { page, url: link };
      }
    } else if (links) {
      return null;
    }

    const page = action === 'next' ? currentPage + 1 : currentPage - 1;

    if (page < 1 || page > totalPages) {
      return null;
    }

    return {
      page,
      url: requestUrl ? replacePageParameter(requestUrl, page) : null,
    };
  }

  const page = action === 'first' ? 1 : action === 'last' ? totalPages : action;

  if (!Number.isInteger(page) || page < 1 || page > totalPages) {
    return null;
  }

  return {
    page,
    url: requestUrl ? replacePageParameter(requestUrl, page) : null,
  };
}

export function getPageNavigationState(
  context: PageNavigationContext
): PageNavigationState {
  return {
    canPrevious: resolvePageNavigation('previous', context) !== null,
    canNext: resolvePageNavigation('next', context) !== null,
  };
}

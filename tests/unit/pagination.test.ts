/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { describe, test, expect } from 'vitest';
import {
  getPageNavigationState,
  getPaginationLinks,
  getPageParameter,
  replacePageParameter,
  resolvePageNavigation,
} from '$app/common/helpers/pagination';
import { PaginationMeta } from '$app/common/interfaces/generic-many-response';

const previousLink =
  'https://grok.romulus.com.au/api/v1/invoices?q=%2Fapi%2Fv1%2Finvoices&per_page=2&balance=gt%3A10&page=1';
const nextLink =
  'https://grok.romulus.com.au/api/v1/invoices?q=%2Fapi%2Fv1%2Finvoices&per_page=2&balance=gt%3A10&page=3';

const pagination: PaginationMeta = {
  total: 51,
  count: 2,
  per_page: 2,
  current_page: 2,
  total_pages: 26,
  links: {
    previous: previousLink,
    next: nextLink,
  },
};

const legacyPagination: PaginationMeta = {
  total: 51,
  count: 2,
  per_page: 2,
  current_page: 2,
  total_pages: 26,
  links: [],
};

describe('getPaginationLinks', () => {
  test('returns the links of the response', () => {
    expect(getPaginationLinks(pagination)).toEqual({
      previous: previousLink,
      next: nextLink,
    });
  });

  test('drops empty and null directions', () => {
    expect(
      getPaginationLinks({ links: { previous: null, next: nextLink } })
    ).toEqual({ previous: undefined, next: nextLink });

    expect(
      getPaginationLinks({ links: { previous: '', next: nextLink } })
    ).toEqual({ previous: undefined, next: nextLink });
  });

  test('returns undefined for backends without link support', () => {
    expect(getPaginationLinks(legacyPagination)).toBeUndefined();
    expect(getPaginationLinks({ links: undefined })).toBeUndefined();
    expect(getPaginationLinks({ links: {} })).toBeUndefined();
    expect(getPaginationLinks(undefined)).toBeUndefined();
    expect(getPaginationLinks(null)).toBeUndefined();
  });
});

describe('getPageParameter', () => {
  test('reads the page of a link', () => {
    expect(getPageParameter(nextLink)).toEqual(3);
    expect(getPageParameter(previousLink)).toEqual(1);
  });

  test('supports relative urls', () => {
    expect(getPageParameter('/api/v1/invoices?page=4')).toEqual(4);
  });

  test('returns null when the page is missing or invalid', () => {
    expect(getPageParameter('https://invoicing.co/api/v1/invoices')).toBeNull();
    expect(getPageParameter('/api/v1/invoices?page=0')).toBeNull();
    expect(getPageParameter('/api/v1/invoices?page=-1')).toBeNull();
    expect(getPageParameter('/api/v1/invoices?page=abc')).toBeNull();
    expect(getPageParameter('/api/v1/invoices?page=1.5')).toBeNull();
    expect(getPageParameter('http://')).toBeNull();
  });
});

describe('replacePageParameter', () => {
  test('replaces the page keeping every other query parameter', () => {
    const url = replacePageParameter(nextLink, 26);

    expect(url).toContain('page=26');
    expect(url).toContain('per_page=2');
    expect(url).toContain('balance=gt%3A10');
    expect(getPageParameter(url as string)).toEqual(26);
  });

  test('adds the page when it is missing', () => {
    expect(
      replacePageParameter('https://invoicing.co/api/v1/invoices', 5)
    ).toEqual('https://invoicing.co/api/v1/invoices?page=5');
  });

  test('returns null for invalid urls', () => {
    expect(replacePageParameter('http://', 5)).toBeNull();
  });
});

describe('resolvePageNavigation', () => {
  const context = {
    currentPage: 2,
    totalPages: 26,
    pagination,
    requestUrl: nextLink.replace('page=3', 'page=2'),
  };

  test('next and previous are driven by the api links', () => {
    expect(resolvePageNavigation('next', context)).toEqual({
      page: 3,
      url: nextLink,
    });

    expect(resolvePageNavigation('previous', context)).toEqual({
      page: 1,
      url: previousLink,
    });
  });

  test('a missing link direction means the page does not exist', () => {
    expect(
      resolvePageNavigation('next', {
        ...context,
        pagination: { ...pagination, links: { previous: previousLink } },
      })
    ).toBeNull();

    expect(
      resolvePageNavigation('previous', {
        ...context,
        pagination: { ...pagination, links: { next: nextLink } },
      })
    ).toBeNull();
  });

  test('falls back to arithmetic for backends without link support', () => {
    const legacyContext = { ...context, pagination: legacyPagination };

    expect(resolvePageNavigation('next', legacyContext)).toEqual({
      page: 3,
      url: expect.stringContaining('page=3'),
    });

    expect(resolvePageNavigation('previous', legacyContext)).toEqual({
      page: 1,
      url: expect.stringContaining('page=1'),
    });

    expect(
      resolvePageNavigation('next', {
        ...legacyContext,
        currentPage: 26,
      })
    ).toBeNull();

    expect(
      resolvePageNavigation('previous', {
        ...legacyContext,
        currentPage: 1,
      })
    ).toBeNull();
  });

  test('falls back to arithmetic when the link has no valid page', () => {
    expect(
      resolvePageNavigation('next', {
        ...context,
        pagination: {
          ...pagination,
          links: { next: 'https://invoicing.co/api/v1/invoices' },
        },
      })
    ).toEqual({ page: 3, url: expect.stringContaining('page=3') });
  });

  test('first and last replace the page of the current request url', () => {
    expect(resolvePageNavigation('first', context)).toEqual({
      page: 1,
      url: expect.stringContaining('page=1'),
    });

    const last = resolvePageNavigation('last', context);

    expect(last).toEqual({ page: 26, url: expect.stringContaining('page=26') });
    expect(last?.url).toContain('balance=gt%3A10');
  });

  test('explicit pages are clamped to the available range', () => {
    expect(resolvePageNavigation(13, context)).toEqual({
      page: 13,
      url: expect.stringContaining('page=13'),
    });

    expect(resolvePageNavigation(0, context)).toBeNull();
    expect(resolvePageNavigation(27, context)).toBeNull();
    expect(resolvePageNavigation(1.5, context)).toBeNull();
  });

  test('resolves the page even without a request url', () => {
    expect(
      resolvePageNavigation('last', { ...context, requestUrl: undefined })
    ).toEqual({ page: 26, url: null });
  });

  test('treats an empty result set as a single page', () => {
    expect(
      resolvePageNavigation('last', {
        currentPage: 1,
        totalPages: 0,
        pagination: undefined,
      })
    ).toEqual({ page: 1, url: null });
  });
});

describe('getPageNavigationState', () => {
  test('both directions available in the middle of the range', () => {
    expect(
      getPageNavigationState({
        currentPage: 2,
        totalPages: 26,
        pagination,
      })
    ).toEqual({ canPrevious: true, canNext: true });
  });

  test('on the first page the api omits the previous link', () => {
    expect(
      getPageNavigationState({
        currentPage: 1,
        totalPages: 26,
        pagination: { ...pagination, links: { next: nextLink } },
      })
    ).toEqual({ canPrevious: false, canNext: true });
  });

  test('on the last page the api omits the next link', () => {
    expect(
      getPageNavigationState({
        currentPage: 26,
        totalPages: 26,
        pagination: { ...pagination, links: { previous: previousLink } },
      })
    ).toEqual({ canPrevious: true, canNext: false });
  });

  test('falls back to page bounds for backends without link support', () => {
    expect(
      getPageNavigationState({
        currentPage: 1,
        totalPages: 26,
        pagination: legacyPagination,
      })
    ).toEqual({ canPrevious: false, canNext: true });

    expect(
      getPageNavigationState({
        currentPage: 26,
        totalPages: 26,
        pagination: legacyPagination,
      })
    ).toEqual({ canPrevious: true, canNext: false });
  });

  test('a single page disables both directions', () => {
    expect(
      getPageNavigationState({
        currentPage: 1,
        totalPages: 1,
        pagination: undefined,
      })
    ).toEqual({ canPrevious: false, canNext: false });
  });
});

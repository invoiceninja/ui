/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface PaginationLinks {
  previous?: string | null;
  next?: string | null;
}

export interface PaginationMeta {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  // Backends without link support serialize `links` as an empty array.
  links?: PaginationLinks | string[];
}

export interface GenericManyResponse<T> {
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}

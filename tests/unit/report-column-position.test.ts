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
import { getColumnPosition } from '$app/pages/reports/common/utils/sortableColumns';

describe('getColumnPosition', () => {
  test('returns the origin group for location fields', () => {
    expect(
      getColumnPosition({
        trans: 'city',
        value: 'location.city',
        map: 'location',
        origin: 'invoice',
      })
    ).toBe(1);
  });

  test('returns the origin group for item fields', () => {
    expect(
      getColumnPosition({
        trans: 'quantity',
        value: 'item.quantity',
        map: '',
        origin: 'purchase_order',
      })
    ).toBe(6);
  });

  test('falls back to map when origin is absent', () => {
    expect(
      getColumnPosition({ trans: 'name', value: 'client.name', map: 'client' })
    ).toBe(0);
  });

  test('returns -1 for unknown groups', () => {
    expect(
      getColumnPosition({ trans: 'city', value: 'location.city', map: 'location' })
    ).toBe(-1);
  });
});

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { describe, expect, test } from 'vitest';
import { resolveCompanyIndex } from '$app/common/helpers/company-index';
import { CompanyUser } from '$app/common/interfaces/company-user';

const companyUsers = [
  { company: { id: 'aaa' }, account: { default_company_id: 'bbb' } },
  { company: { id: 'bbb' }, account: { default_company_id: 'bbb' } },
  { company: { id: 'ccc' }, account: { default_company_id: 'bbb' } },
] as unknown as CompanyUser[];

describe('resolveCompanyIndex', () => {
  test('?company= wins, and says so, so the caller can persist it', () => {
    expect(
      resolveCompanyIndex({ companyUsers, requestedCompanyId: 'ccc' })
    ).toEqual({ index: 2, fromUrl: true });
  });

  test('?company= beats a stored index', () => {
    // A shared link is about one record in one company.
    expect(
      resolveCompanyIndex({
        companyUsers,
        requestedCompanyId: 'aaa',
        storedIndex: '2',
      })
    ).toEqual({ index: 0, fromUrl: true });
  });

  test('an unknown ?company= falls through instead of erroring', () => {
    // A link from another account, or another server. The user stays where they
    // were and the record request fails on its own.
    expect(
      resolveCompanyIndex({
        companyUsers,
        requestedCompanyId: 'not-ours',
        storedIndex: '2',
      })
    ).toEqual({ index: 2, fromUrl: false });
  });

  test('without a param, the stored index is used', () => {
    expect(resolveCompanyIndex({ companyUsers, storedIndex: '1' })).toEqual({
      index: 1,
      fromUrl: false,
    });
  });

  test('with neither, the account default is used', () => {
    expect(resolveCompanyIndex({ companyUsers })).toEqual({
      index: 1,
      fromUrl: false,
    });
  });

  test('a stale or unparseable stored index never escapes as one', () => {
    expect(resolveCompanyIndex({ companyUsers, storedIndex: '9' }).index).toBe(
      0
    );
    expect(resolveCompanyIndex({ companyUsers, storedIndex: '-1' }).index).toBe(
      0
    );
    expect(
      resolveCompanyIndex({ companyUsers, storedIndex: 'nonsense' }).index
    ).toBe(0);
  });

  test('an unresolvable default_company_id falls back to the first', () => {
    const orphaned = [
      { company: { id: 'aaa' }, account: { default_company_id: 'gone' } },
    ] as unknown as CompanyUser[];

    expect(resolveCompanyIndex({ companyUsers: orphaned }).index).toBe(0);
  });

  test('an empty roster resolves to 0 rather than -1', () => {
    expect(
      resolveCompanyIndex({ companyUsers: [], requestedCompanyId: 'aaa' })
    ).toEqual({ index: 0, fromUrl: false });
  });
});

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CompanyUser } from '$app/common/interfaces/company-user';

export interface CompanyIndexContext {
  companyUsers: CompanyUser[];
  /** `?company=<hashed id>`, when the URL asked for one. */
  requestedCompanyId?: string | null;
  /** The persisted `X-CURRENT-INDEX`, as stored. */
  storedIndex?: string | null;
}

export interface CompanyIndexResolution {
  index: number;
  /** True when the URL chose it, i.e. when the caller should persist it. */
  fromUrl: boolean;
}

/**
 * Which company to open with, in order of precedence:
 *
 *   1. `?company=<hashed id>`, when it names a company this user actually has
 *   2. the stored `X-CURRENT-INDEX`
 *   3. the account's `default_company_id`
 *   4. the first company
 *
 * (1) exists so a record link shared out of the mobile app lands the recipient
 * in the workspace the link is about rather than wherever they happened to be;
 * the id in the link is the same hashed id as `companyUser.company.id`. An
 * unknown one falls through to what would have happened anyway — a link from
 * another account or another server then leaves the user exactly where they
 * were, and the record request 404s on its own.
 *
 * Every result is clamped into range, so a `-1` from `findIndex` or a stale
 * stored index can never escape as one.
 */
export function resolveCompanyIndex(
  context: CompanyIndexContext
): CompanyIndexResolution {
  const { companyUsers, requestedCompanyId, storedIndex } = context;

  const clamp = (index: number) =>
    index >= 0 && index < companyUsers.length ? index : 0;

  if (requestedCompanyId) {
    const requested = companyUsers.findIndex(
      (companyUser) => companyUser.company?.id === requestedCompanyId
    );

    if (requested > -1) {
      return { index: requested, fromUrl: true };
    }
  }

  if (storedIndex) {
    const stored = parseInt(storedIndex);

    return { index: clamp(Number.isNaN(stored) ? 0 : stored), fromUrl: false };
  }

  const defaultCompanyId = companyUsers[0]?.account?.default_company_id;

  return {
    index: clamp(
      companyUsers.findIndex(
        (companyUser) => companyUser.company?.id === defaultCompanyId
      )
    ),
    fromUrl: false,
  };
}

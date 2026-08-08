/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';

export function isAccountPlanExpired(
  plan?: string | null,
  planExpires?: string | null
) {
  const expiry = dayjs(planExpires);

  return (
    Boolean(plan) &&
    Boolean(planExpires) &&
    expiry.isValid() &&
    expiry.isBefore(dayjs())
  );
}

interface AccountPlanExpiredBannerVisibilityParams {
  forceDisplay?: boolean;
  isHosted: boolean;
  isOwner: boolean;
  plan?: string | null;
  planExpires?: string | null;
}

export function shouldDisplayAccountPlanExpiredBanner({
  forceDisplay,
  isHosted,
  isOwner,
  plan,
  planExpires,
}: AccountPlanExpiredBannerVisibilityParams) {
  return (
    Boolean(forceDisplay) ||
    (isHosted && isOwner && isAccountPlanExpired(plan, planExpires))
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Invoice } from '$app/common/interfaces/invoice';
import { Banner } from '$app/components/Banner';

interface Props {
  className?: string;
  resource: Invoice;
}

export function QuickbooksDepositDisabledAlert({ resource, className }: Props) {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  // A partial/deposit amount is always required — the warning is only relevant
  // when the invoice actually carries a deposit.
  const hasPartial = resource.partial > 0;

  const allowDeposit = company?.quickbooks?.allow_deposit === true;

  // Visual-check override: lets the banner be confirmed without a fully
  // configured QBO account. It only bypasses the QBO preference check — a
  // partial amount is still required, so the banner never shows on an empty
  // partial field.
  const forced =
    import.meta.env.VITE_FORCE_QUICKBOOKS_DEPOSIT_WARNING === 'true';

  if (!hasPartial || (!allowDeposit && !forced)) {
    return null;
  }

  return (
    <Banner className={className} variant="orange">
      {t('quickbooks_deposit_disabled_warning')}
    </Banner>
  );
}

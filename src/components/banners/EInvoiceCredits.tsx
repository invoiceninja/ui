/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTranslation } from 'react-i18next';
import { Banner } from '../Banner';
import { buttonStyles } from './VerifyEmail';
import { useQuota } from '$app/pages/settings/e-invoice/peppol/Preferences';
import { Link } from 'react-router-dom';

export const EINVOICE_CREDITS_MIN_THRESHOLD = 15;

export function EInvoiceCredits() {
  const company = useCurrentCompany();
  // const quota = useQuota();

  const { t } = useTranslation();

  if (
    !company.legal_entity_id ||
    company.settings.e_invoice_type !== 'PEPPOL'
  ) {
    return null;
  }

  // if (quota === 0) {
  //   return (
  //     <Banner variant="red">
  //       <div className="flex space-x-1">
  //         <span>{t('notification_no_credits')}</span>

  //         <Link to="/settings/e_invoice" className={buttonStyles}>
  //           {t('learn_more')}
  //         </Link>
  //       </div>
  //     </Banner>
  //   );
  // }

  // if (quota <= EINVOICE_CREDITS_MIN_THRESHOLD) {
  //   return (
  //     <Banner variant="orange">
  //       <div className="flex space-x-1">
  //         <span>{t('notification_credits_low')}</span>

  //         <Link to="/settings/e_invoice" className={buttonStyles}>
  //           {t('learn_more')}
  //         </Link>
  //       </div>
  //     </Banner>
  //   );
  // }

  return null;
}

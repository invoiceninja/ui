/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Settings } from 'components/layouts/Settings';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function PaymentTerms() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('payment_terms')}`;
  });

  return <Settings title={t('payment_terms')}>{/*  */}</Settings>;
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';

export function InvoiceDesign() {
  const [t] = useTranslation();

  return <Settings title={t('invoice_design')}>{/*  */}</Settings>;
}

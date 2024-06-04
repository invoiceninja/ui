/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { EInvoiceGenerator } from '$app/components/e-invoice/EInvoiceGenerator';
import { useTranslation } from 'react-i18next';

export default function EInvoice() {
  const [t] = useTranslation();

  return (
    <Card title={t('e_invoice')}>
      <EInvoiceGenerator country={'italy'} entityLevel />
    </Card>
  );
}

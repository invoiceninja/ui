/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Tab, Tabs } from '$app/components/Tabs';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';

export default function InvoiceDesign() {
  const { documentTitle } = useTitle('invoice_design');
  const { t } = useTranslation();

  const tabs: Tab[] = [
    { name: t('general_settings'), href: '/settings/invoice_design' },
    {
      name: t('custom_designs'),
      href: '/settings/invoice_design/custom_designs',
    },
  ];

  return (
    <Default title={documentTitle}>
      <Tabs tabs={tabs} />
    </Default>
  );
}

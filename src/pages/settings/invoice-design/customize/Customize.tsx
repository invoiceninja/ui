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
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Customize() {
  const { documentTitle } = useTitle('customize_and_preview');
  const { t } = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('invoice_design'), href: '/settings/invoice_design' },
    {
      name: t('customize_and_preview'),
      href: '/settings/invoice_design/customize',
    },
  ];

  return <Default title={documentTitle} breadcrumbs={pages}></Default>;
}

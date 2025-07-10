/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';

function Settings() {
  const [t] = useTranslation();

  const pages = [
    {
      name: t('documents'),
      href: '/documents',
    },
    {
      name: t('settings'),
      href: '/documents/settings',
    },
  ];

  return (
    <Default title={t('settings')} breadcrumbs={pages}>
      Settings
    </Default>
  );
}

export default Settings;

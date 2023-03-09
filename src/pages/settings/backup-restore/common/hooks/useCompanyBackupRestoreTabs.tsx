/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';

export function useCompanyBackupRestoreTabs() {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    { name: t('backup'), href: '/settings/backup_restore' },
    { name: t('restore'), href: '/settings/backup_restore/restore' },
  ];

  return tabs;
}

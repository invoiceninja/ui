/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Settings } from '$app/components/layouts/Settings';
import { Tabs } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useCompanyBackupRestoreTabs } from '../common/hooks/useCompanyBackupRestoreTabs';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';

export function BackupRestore() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const tabs = useCompanyBackupRestoreTabs();

  const pages = [
    { name: t('settings'), href: '/settings' },
    {
      name: t('backup_restore'),
      href: '/settings/backup_restore',
    },
  ];

  return (
    <Settings title={t('backup_restore')} breadcrumbs={pages}>
      <Card
        className="shadow-sm"
        title={t('backup_restore')}
        withoutBodyPadding
        withoutHeaderBorder
        style={{ borderColor: colors.$24 }}
      >
        <Tabs
          tabs={tabs}
          horizontalPaddingWidth="1.5rem"
          withHorizontalPadding
          fullRightPadding
          withHorizontalPaddingOnSmallScreen
        />

        <div className="pt-4 pb-6">
          <Outlet />
        </div>
      </Card>
    </Settings>
  );
}

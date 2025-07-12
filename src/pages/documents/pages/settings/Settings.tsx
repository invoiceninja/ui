/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { Default } from '$app/components/layouts/Default';
import { Tabs } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useSettingsTabs } from './common/hooks/useSettingsTabs';

function Settings() {
  const [t] = useTranslation();

  const tabs = useSettingsTabs();
  const colors = useColorScheme();

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
      <Card
        title={t('settings')}
        className="shadow-sm pb-6"
        withoutBodyPadding
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        withoutHeaderBorder
      >
        <Tabs
          tabs={tabs}
          withHorizontalPadding
          horizontalPaddingWidth="1.5rem"
          fullRightPadding
          withHorizontalPaddingOnSmallScreen
        />

        <div className="pt-4">
          <Outlet />
        </div>
      </Card>
    </Default>
  );
}

export default Settings;

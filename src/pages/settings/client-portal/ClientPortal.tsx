/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import {
  Authorization,
  Customize,
  Messages,
  Registration,
  Settings as SettingsComponent,
} from './components';

export function ClientPortal() {
  const [t] = useTranslation();
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('client_portal'), href: '/settings/client_portal' },
  ];
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('client_portal')}`;
  });

  return (
    <Settings
      title={t('client_portal')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#client_portal"
    >
      <SettingsComponent />
      <Registration />
      <Authorization />
      <Messages />
      <Customize />
    </Settings>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Breadcrumbs } from 'components/Breadcrumbs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ClickableElement } from '../../../components/cards';
import { Settings } from '../../../components/layouts/Settings';
import {
  EnabledModules,
  Integrations,
  Licence,
  Overview,
  Plan,
  SecuritySettings,
} from './component';

export function AccountManagement() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'account_management'
    )}`;
  });

  return (
    <Settings title={t('account_management')}>
      <Breadcrumbs pages={pages} />

      <Plan />
      <Overview />
      <Licence />
      <Integrations />
      <EnabledModules />
      <SecuritySettings />

      <Card title="Danger zone">
        <ClickableElement className="text-red-500 hover:text-red-600">
          {t('purge_data')}
        </ClickableElement>
        <ClickableElement className="text-red-500 hover:text-red-600">
          {t('cancel_account')}
        </ClickableElement>
      </Card>
    </Settings>
  );
}

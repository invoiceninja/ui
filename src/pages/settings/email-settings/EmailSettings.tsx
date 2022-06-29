/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/cards';
import { Settings } from '../../../components/layouts/Settings';

export function EmailSettings() {
  useTitle('email_settings');
  
  const [t] = useTranslation();

  const pages =
   [
    { name: t('settings'), href: '/settings' },
    { name: t('email_settings'), href: '/settings/email_settings' },
  ];

  return (
    <Settings
      title={t('email_settings')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#email_settings"
    >
      <Card title={t('settings')}>{/*  */}</Card>
    </Settings>
  );
}

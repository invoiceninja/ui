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
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';

export function Users() {
  useTitle('user_management');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_management'), href: '/settings/users' },
  ];

  return (
    <Settings
      title={t('user_details')}
      breadcrumbs={pages}
      docsLink="/docs/advanced-settings/#user_management"
    >
      {/*  */}
    </Settings>
  );
}

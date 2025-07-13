/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';

export function useSettingsTabs() {
  const [t] = useTranslation();

  const tabs: Tab[] = [
    { name: t('email_templates'), href: '/documents/settings' },
    {
      name: t('users'),
      href: '/documents/settings/users',
      matcher: [
        () => '/documents/settings/users/create',
        (params) => route('/documents/settings/users/:id/edit', params),
      ],
    },
  ];

  return tabs;
}

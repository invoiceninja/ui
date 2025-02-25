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
import { useParams } from 'react-router-dom';

export function useTabs() {
  const [t] = useTranslation();

  const { id } = useParams();

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/clients/:id/edit', { id }),
    },
    {
      name: t('settings'),
      href: route('/clients/:id/settings', { id }),
    },
    {
      name: t('notes'),
      href: route('/clients/:id/notes', { id }),
    },
    {
      name: t('classify'),
      href: route('/clients/:id/classify', { id }),
    },
    {
      name: t('documents'),
      href: route('/clients/:id/documents', { id }),
    },
    {
      name: t('locations'),
      href: route('/clients/:id/locations', { id }),
    },
  ];

  return tabs;
}

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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function useTabs() {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const { id } = useParams();

  let tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/products/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/products/:id/documents', { id }),
    },
    {
      name: t('product_fields'),
      href: route('/products/:id/product_fields', { id }),
    },
  ];

  if (!hasPermission('edit_product')) {
    tabs = tabs.filter(({ name }) => name === t('edit'));
  }

  return tabs;
}

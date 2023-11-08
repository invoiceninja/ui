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
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function useTabs() {
  const [t] = useTranslation();

  const { isAdmin, isOwner } = useAdmin();

  const { id } = useParams();

  const hasPermission = useHasPermission();

  return [
    {
      name: t('edit'),
      href: route('/products/:id/edit', { id }),
    },
    ...(hasPermission('edit_product')
      ? [
          {
            name: t('documents'),
            href: route('/products/:id/documents', { id }),
          },
        ]
      : []),
    ...(isAdmin || isOwner
      ? [
          {
            name: t('product_fields'),
            href: route('/products/:id/product_fields', { id }),
          },
        ]
      : []),
  ];
}

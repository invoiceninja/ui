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
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { Product } from '$app/common/interfaces/product';
import { useTranslation } from 'react-i18next';

interface Params {
  product: Product | undefined;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const { product } = params;

  const { isAdmin, isOwner } = useAdmin();

  const entityAssigned = useEntityAssigned();

  const hasPermission = useHasPermission();

  return product
    ? [
        {
          name: t('edit'),
          href: route('/products/:id/edit', { id: product.id }),
        },
        ...(hasPermission('view_product') ||
        hasPermission('edit_product') ||
        entityAssigned(product)
          ? [
              {
                name: t('documents'),
                href: route('/products/:id/documents', { id: product.id }),
              },
            ]
          : []),
        ...(isAdmin || isOwner
          ? [
              {
                name: t('product_fields'),
                href: route('/products/:id/product_fields', { id: product.id }),
              },
            ]
          : []),
      ]
    : [];
}

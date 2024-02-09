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
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Params {
  product: Product | undefined;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const { product } = params;

  const { id } = useParams();

  const { isAdmin, isOwner } = useAdmin();

  const entityAssigned = useEntityAssigned();

  const hasPermission = useHasPermission();

  const canEditAndView =
    hasPermission('view_product') ||
    hasPermission('edit_product') ||
    entityAssigned(product);

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/products/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/products/:id/documents', { id }),
      enabled: canEditAndView,
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={product?.documents?.length} />
      ),
    },
    {
      name: t('product_fields'),
      href: route('/products/:id/product_fields', { id }),
      enabled: isAdmin || isOwner,
    },
  ];

  return tabs;
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useLocation, useParams } from 'react-router-dom';

interface Params {
  entity:
    | 'invoice'
    | 'quote'
    | 'payment'
    | 'recurring_invoice'
    | 'credit'
    | 'project'
    | 'task'
    | 'expense'
    | 'recurring_expense'
    | 'purchase_order'
    | 'client'
    | 'vendor'
    | 'product';
  editPageHasLinkedTabs?: boolean;
}

export function useEntityPageIdentifier(params: Params) {
  const { entity, editPageHasLinkedTabs } = params;

  const location = useLocation();
  const urlParams = useParams();

  const entityId = urlParams.id || '';

  const startsWithEntityName = location.pathname.startsWith(`/${entity}s`);
  const includesEntityId = entityId && location.pathname.includes(entityId);
  const endsWithEdit = location.pathname.endsWith('/edit');

  const isEditPage =
    startsWithEntityName &&
    includesEntityId &&
    (editPageHasLinkedTabs || endsWithEdit);

  const isShowPage = startsWithEntityName && includesEntityId && !endsWithEdit;

  const isEditOrShowPage = isEditPage || isShowPage;

  return { isEditPage, isShowPage, isEditOrShowPage };
}

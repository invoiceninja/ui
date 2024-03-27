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
    | 'product'
    | 'transaction';
  editPageTabs?: string[];
}

export function useEntityPageIdentifier(params: Params) {
  const { entity, editPageTabs } = params;

  const location = useLocation();
  const urlParams = useParams();

  const entityId = urlParams.id || '';

  const startsWithEntityName = location.pathname.startsWith(`/${entity}s`);
  const includesEntityId = entityId && location.pathname.includes(entityId);
  const endsWithEdit = location.pathname.endsWith('/edit');
  const endsWithEditPageTab = editPageTabs?.some((tab) =>
    location.pathname.endsWith(`/${tab}`)
  );

  const isEditPage =
    startsWithEntityName &&
    includesEntityId &&
    (endsWithEditPageTab || endsWithEdit);

  const isShowPage =
    startsWithEntityName &&
    includesEntityId &&
    !endsWithEdit &&
    !endsWithEditPageTab;

  const isEditOrShowPage = isEditPage || isShowPage;

  return { isEditPage, isShowPage, isEditOrShowPage };
}

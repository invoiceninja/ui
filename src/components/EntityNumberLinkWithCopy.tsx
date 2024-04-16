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
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { CopyToClipboardIconOnly } from './CopyToClipBoardIconOnly';
import { DynamicLink } from './DynamicLink';

interface Props {
  entity: 'invoice' | 'quote' | 'credit' | 'purchase_order';
  entityRoute: string;
  resource: Invoice | Quote | Credit | PurchaseOrder;
}

export function EntityNumberLinkWithCopy(props: Props) {
  const { entity, entityRoute, resource } = props;

  const disableNavigation = useDisableNavigation();

  return (
    <div className="flex space-x-2">
      <DynamicLink
        to={route(entityRoute, { id: resource.id })}
        renderSpan={disableNavigation(entity, resource)}
      >
        {resource.number}
      </DynamicLink>

      <CopyToClipboardIconOnly text={resource.number} stopPropagation />
    </div>
  );
}

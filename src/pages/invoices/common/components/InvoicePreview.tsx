/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { previewEndpoint } from 'common/helpers';
import { Credit } from 'common/interfaces/credit';
import { Invoice } from 'common/interfaces/invoice';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { Quote } from 'common/interfaces/quote';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { InvoiceViewer } from './InvoiceViewer';
import { RelationType } from './ProductsTable';

interface Props {
  for: 'create' | 'invoice';
  resource: Invoice | RecurringInvoice | Quote | Credit | PurchaseOrder;
  entity:
    | 'invoice'
    | 'recurring_invoice'
    | 'quote'
    | 'credit'
    | 'purchase_order';
  relationType: RelationType;
  endpoint?:
    | '/api/v1/live_preview?entity=:entity'
    | '/api/v1/live_preview/purchase_order?entity=:entity';
}

export function InvoicePreview(props: Props) {
  const endpoint = props.endpoint || '/api/v1/live_preview?entity=:entity';

  if (props.resource?.[props.relationType] && props.for === 'create') {
    return (
      <InvoiceViewer
        link={previewEndpoint(endpoint, {
          entity: props.entity,
        })}
        resource={props.resource}
        method="POST"
      />
    );
  }

  if (
    props.resource?.id &&
    props.resource?.[props.relationType] &&
    props.for === 'invoice'
  ) {
    return (
      <InvoiceViewer
        link={previewEndpoint(endpoint, {
          entity: props.entity,
          id: props.resource?.id,
        })}
        resource={props.resource}
        method="POST"
      />
    );
  }

  return <></>;
}

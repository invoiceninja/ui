/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { Invoice } from 'common/interfaces/invoice';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { InvoiceViewer } from './InvoiceViewer';

interface Props {
  for: 'create' | 'invoice';
  resource: Invoice | RecurringInvoice;
  entity: 'invoice' | 'recurring_invoice';
}

export function InvoicePreview(props: Props) {
  if (props.resource?.client_id && props.for === 'create') {
    return (
      <InvoiceViewer
        link={endpoint('/api/v1/live_preview?entity=:entity', {
          entity: props.entity,
        })}
        resource={props.resource}
        method="POST"
      />
    );
  }

  if (
    props.resource?.id &&
    props.resource?.client_id &&
    props.for === 'invoice'
  ) {
    return (
      <InvoiceViewer
        link={endpoint('/api/v1/live_preview?entity=:entity&entity_id=:id', {
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

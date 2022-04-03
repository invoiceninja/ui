/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Invoice } from 'common/interfaces/invoice';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { useEffect } from 'react';
import { InvoiceViewer } from './InvoiceViewer';

interface Props {
  for: 'create' | 'invoice';
  resource: Invoice | RecurringInvoice;
}

export function InvoicePreview(props: Props) {
  if (props.resource?.client_id && props.for === 'create') {
    return (
      <InvoiceViewer
        link={endpoint('/api/v1/live_preview?entity=invoice')}
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
        link={endpoint('/api/v1/live_preview?entity=invoice&entity_id=:id', {
          id: props.resource?.id,
        })}
        resource={props.resource}
        method="POST"
      />
    );
  }

  return <></>;
}

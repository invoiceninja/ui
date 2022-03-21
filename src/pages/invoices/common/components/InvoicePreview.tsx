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
import { InvoiceViewer } from './InvoiceViewer';

interface Props {
  for: 'create' | 'invoice';
}

export function InvoicePreview(props: Props) {
  const invoice = useCurrentInvoice();

  if (invoice?.id && invoice?.client_id) {
    return (
      <InvoiceViewer
        link={
          props.for === 'create'
            ? endpoint('/api/v1/live_preview?entity=invoice')
            : endpoint('/api/v1/live_preview?entity=invoice&entity_id=:id', {
                id: invoice?.id,
              })
        }
        resource={invoice}
        method="POST"
      />
    );
  }

  return <></>;
}

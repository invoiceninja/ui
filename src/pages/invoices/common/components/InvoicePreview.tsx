/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { previewEndpoint } from '$app/common/helpers';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { useEffect, useRef, useState } from 'react';
import { InvoiceViewer } from './InvoiceViewer';
import { RelationType } from './ProductsTable';

export type Resource =
  | Invoice
  | RecurringInvoice
  | Quote
  | Credit
  | PurchaseOrder;

interface Props {
  for: 'create' | 'invoice';
  resource: Resource;
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
  initiallyVisible?: boolean;
  observable?: boolean;
}

export function InvoicePreview(props: Props) {
  const [render, setRender] = useState(props.initiallyVisible ?? true);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const endpoint = props.endpoint || '/api/v1/live_preview?entity=:entity';
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!props.observable) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => {
          if (entry.isIntersecting) {
            setRender(true);
            setIsIntersecting(true);
          } else {
            setIsIntersecting(false);
          }
        },
        { threshold: 1 }
      );
    });

    observer.observe(divRef.current!);

    return () => {
      observer.disconnect();
    };
  }, [divRef]);

  useEffect(() => {
    if (!props.observable) {
      return;
    }

    setRender(isIntersecting);
  }, [props.resource]);

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
    props.entity === 'purchase_order'
  ) {
    return (
      <InvoiceViewer
        link={previewEndpoint(
          '/api/v1/live_preview/purchase_order?entity=:entity&entity_id=:id',
          {
            entity: props.entity,
            id: props.resource?.id,
          }
        )}
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
      <div ref={divRef}>
        {render ? (
          <InvoiceViewer
            link={previewEndpoint(
              '/api/v1/live_preview?entity=:entity&entity_id=:id',
              {
                entity: props.entity,
                id: props.resource?.id,
              }
            )}
            method="POST"
            resource={props.resource}
            enabled={props.observable ? isIntersecting : true}
          />
        ) : null}
      </div>
    );
  }

  return <></>;
}

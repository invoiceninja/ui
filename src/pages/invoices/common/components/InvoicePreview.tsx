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
import { RemoveLogoCTA } from '$app/components/RemoveLogoCTA';
import { debounce } from 'lodash';

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
  withRemoveLogoCTA?: boolean;
  debouncedTrigger?: number; // Increments on debounced changes
}

export function InvoicePreview(props: Props) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const endpoint = props.endpoint || '/api/v1/live_preview?entity=:entity';
  const divRef = useRef<HTMLDivElement>(null);
  const triggerUpdate = useRef(false);
  const isCurrentlyIntersecting = useRef(false);
  const intersectionTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!props.observable) {
      return;
    }

    const debouncedKeydown = debounce(() => {
      console.log("debounced keydown triggered");
      triggerUpdate.current = true;
      if (isCurrentlyIntersecting.current) {
        setIsIntersecting(true);
      }
    }, 1000);

    const handleKeydown = () => {
      debouncedKeydown();
    };

    window.addEventListener('keydown', handleKeydown);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => {
          // Clear any existing timer
          if (intersectionTimer.current) {
            clearTimeout(intersectionTimer.current);
            intersectionTimer.current = null;
          }

          if (entry.isIntersecting) {
            // Set a timer to update state after 500ms of continuous intersection
            intersectionTimer.current = setTimeout(() => {
              console.log("intersection maintained for required time");
              isCurrentlyIntersecting.current = true;
              if (triggerUpdate.current) {
                console.log("intersection with pending update, refreshing view");
                setIsIntersecting(true);
                triggerUpdate.current = false;
              }
            }, 1000);
          } else {
            console.log("not intersecting NOW");
            isCurrentlyIntersecting.current = false;
            setIsIntersecting(false);
          }
        }
      );
    },
      { threshold: 0.3, rootMargin: '0px' }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      debouncedKeydown.cancel();
      observer.disconnect();
      if (intersectionTimer.current) {
        clearTimeout(intersectionTimer.current);
      }
    };
  }, [divRef.current, props.observable]);

  useEffect(() => {
    if (!props.observable) {
      return;
    }
  }, [props.resource]);

  if (props.resource?.[props.relationType] && props.for === 'create') {
    return (
      <div ref={divRef}>
        <InvoiceViewer
          link={previewEndpoint(endpoint, {
            entity: props.entity,
          })}
          resource={props.resource}
          method="POST"
          enabled={props.observable ? isIntersecting : true}
        />
      </div>
    );
  }

  if (
    props.resource?.id &&
    props.resource?.[props.relationType] &&
    props.entity === 'purchase_order'
  ) {
    return (
      <div className="flex flex-col space-y-3">
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
          enabled={props.observable ? isIntersecting : true}
        />

        {props.withRemoveLogoCTA && <RemoveLogoCTA />}
      </div>
    );
  }

  if (
    props.resource?.id &&
    props.resource?.[props.relationType] &&
    props.for === 'invoice'
  ) {
    return (
      <div className="flex flex-col space-y-3">
        <div ref={divRef}>
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
        </div>

        {props.withRemoveLogoCTA && <RemoveLogoCTA />}
      </div>
    );
  }

  return <></>;
}

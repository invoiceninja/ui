/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import {
  EInvoiceLinesRoot,
  getLineEntries,
  realignLineEntries,
  withLineEntries,
} from './fields';

interface Resource {
  line_items: InvoiceItem[];
  e_invoice?: unknown;
}

interface Params<T extends Resource> {
  resource: T | undefined;
  setResource: Dispatch<SetStateAction<T | undefined>>;
  root: EInvoiceLinesRoot;
}

const getLineIds = (resource: Resource | undefined) => {
  return Array.isArray(resource?.line_items)
    ? resource.line_items.map((lineItem) => lineItem._id ?? '')
    : [];
};

export const useEInvoiceLinesAlignment = <T extends Resource>({
  resource,
  setResource,
  root,
}: Params<T>) => {
  const alignedIds = useRef<string[]>([]);

  const ids = getLineIds(resource);
  const idsKey = ids.join(',');

  useEffect(() => {
    if (!resource) {
      alignedIds.current = [];
      return;
    }

    if (ids.some((id) => !id)) {
      return;
    }

    const previousIds = alignedIds.current;

    alignedIds.current = ids;

    const entries = realignLineEntries(
      getLineEntries(resource.e_invoice, root),
      previousIds,
      ids
    );

    if (!entries) {
      return;
    }

    setResource((current) =>
      current && getLineIds(current).join(',') === idsKey
        ? ({
            ...current,
            e_invoice: withLineEntries(current.e_invoice, root, entries),
          } as T)
        : current
    );
  }, [idsKey]);
};

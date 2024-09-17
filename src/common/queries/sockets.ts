/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSockets } from '../hooks/useSockets';
import { useEffect } from 'react';
import { useCurrentCompany } from '../hooks/useCurrentCompany';
import { $refetch } from '../hooks/useRefetch';

// This file defines global events system for query invalidation.

export function useGlobalSocketEvents() {
  const sockets = useSockets();
  const company = useCurrentCompany();

  useEffect(() => {
    if (!sockets || !company) {
      return;
    }

    sockets.connection.bind('connected', () => {
      const invoices = sockets.subscribe(`${company.company_key}_invoices`);

      invoices.bind('invoice.paid', () => $refetch(['invoices']));
    });
  }, [sockets, company]);

  return null;
}

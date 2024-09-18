/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useSockets } from '$app/common/hooks/useSockets';
import { Invoice } from '$app/common/interfaces/invoice';
import { useEffect } from 'react';

export interface Props {
  invoice: Invoice;
}

export function Presence({ invoice }: Props) {
  const sockets = useSockets();
  const company = useCurrentCompany();

  useEffect(() => {
    if (!sockets || !company) {
      return;
    }

    const channel = sockets.subscribe(
      `private-company-${company.company_key}.invoices.${invoice.id}`
    );

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('presence');
    });

    channel.bind('pusher:member_added', () => {
      console.log('member added');
    });

    channel.bind('pusher:member_removed', () => {
      console.log('member removed');
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [sockets, company, invoice.id]);

  return <div>Presence</div>;
}

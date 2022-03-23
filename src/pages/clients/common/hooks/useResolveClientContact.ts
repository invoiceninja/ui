/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClientContact } from 'common/interfaces/client-contact';
import { useClientQuery } from 'common/queries/clients';

export function useResolveClientContact(clientId: string) {
  const { data: client } = useClientQuery({ id: clientId });

  return (contactId: string) =>
    client?.data.data.contacts.find(
      (contact: ClientContact) => contact.id === contactId
    );
}

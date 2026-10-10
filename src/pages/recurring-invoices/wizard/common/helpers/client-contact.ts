/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';

export const contactEmail = (contact: ClientContact | undefined): string => {
  return (contact?.email ?? '').trim();
};

export const emailableContact = (
  client: Client | undefined
): ClientContact | undefined => {
  const contacts = client?.contacts ?? [];

  return (
    contacts.find(
      (entry) => entry.send_email !== false && contactEmail(entry)
    ) ?? contacts[0]
  );
};

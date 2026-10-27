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

export const invitedEmails = (
  invitations: { client_contact_id: string }[] | undefined,
  client: Client | undefined
): string[] => {
  return (invitations ?? [])
    .map((invitation) => {
      return contactEmail(
        client?.contacts?.find(
          (contact) => contact.id === invitation.client_contact_id
        )
      );
    })
    .filter((email) => email.length > 0);
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

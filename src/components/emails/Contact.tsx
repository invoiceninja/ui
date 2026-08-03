/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useVendorResolver } from '$app/common/hooks/vendors/useVendorResolver';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { Vendor } from '$app/common/interfaces/vendor';
import { VendorContact } from '$app/common/interfaces/vendor-contact';

import {
  MailerResource,
  MailerResourceType,
} from '$app/pages/invoices/email/components/Mailer';
import { UserUnsubscribedTooltip } from '$app/pages/clients/common/components/UserUnsubscribedTooltip';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Element } from '$app/components/cards';

interface Props {
  resource: MailerResource;
  resourceType: MailerResourceType;
}

interface ContactLineProps {
  contact: ClientContact | VendorContact;
}

function ContactLine({ contact }: ContactLineProps) {
  return (
    <div className="flex items-center space-x-2">
      <p>
        {contact.first_name} {contact.last_name} &#183;
        <span className="font-semibold"> {contact.email}</span>
      </p>

      {(contact as ClientContact).is_locked && (
        <UserUnsubscribedTooltip size={20} />
      )}
    </div>
  );
}

export function Contact(props: Props) {
  const [t] = useTranslation();

  const clientResolver = useClientResolver();
  const vendorResolver = useVendorResolver();

  const [relation, setRelation] = useState<Vendor | Client>();
  const [relationKey, setRelationKey] = useState<
    'vendor_contact_id' | 'client_contact_id'
  >('client_contact_id');

  useEffect(() => {
    if (
      props.resourceType === 'purchase_order' &&
      props.resource.vendor_id.length >= 1
    ) {
      vendorResolver
        .find(props.resource.vendor_id)
        .then((vendor) => setRelation(vendor))
        .then(() => setRelationKey('vendor_contact_id'));
    }

    if (
      props.resourceType !== 'purchase_order' &&
      props.resource.client_id.length >= 1
    ) {
      clientResolver
        .find(props.resource.client_id)
        .then((client) => setRelation(client))
        .then(() => setRelationKey('client_contact_id'));
    }
  }, []);

  const { toContacts, ccContacts } = useMemo(() => {
    if (!relation) {
      return { toContacts: [], ccContacts: [] };
    }

    const isInvited = (contactId: string) =>
      props.resource.invitations.some(
        (invitation) => invitation[relationKey] === contactId
      );

    return {
      toContacts: relation.contacts.filter(
        (contact) => isInvited(contact.id) && !contact.cc_only
      ),
      ccContacts: relation.contacts.filter((contact) => contact.cc_only),
    };
  }, [relation, props.resource.invitations, relationKey]);

  return (
    <>
      <Element leftSide={t('to')}>
        {relation && (
          <div>
            {toContacts.map((contact, index) => (
              <ContactLine key={index} contact={contact} />
            ))}
          </div>
        )}
      </Element>

      {ccContacts.length > 0 && (
        <Element leftSide={t('cc')}>
          <div>
            {ccContacts.map((contact, index) => (
              <ContactLine key={index} contact={contact} />
            ))}
          </div>
        </Element>
      )}
    </>
  );
}

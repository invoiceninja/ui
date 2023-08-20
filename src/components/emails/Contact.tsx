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
import { Vendor } from '$app/common/interfaces/vendor';

import {
  MailerResource,
  MailerResourceType,
} from '$app/pages/invoices/email/components/Mailer';
import { useEffect, useState } from 'react';

interface Props {
  resource: MailerResource;
  resourceType: MailerResourceType;
}

export function Contact(props: Props) {
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

  return (
    <>
      {relation && (
        <div>
          {relation.contacts
            .filter((contact) =>
              props.resource.invitations.find(
                (invitation) => invitation[relationKey] === contact.id
              )
            )
            .map((contact, index) => (
              <p key={index}>
                {contact.first_name} {contact.last_name} &#183;
                <span className="font-semibold"> {contact.email}</span>
              </p>
            ))}
        </div>
      )}
    </>
  );
}

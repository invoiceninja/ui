/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useVendorResolver } from 'common/hooks/vendors/useVendorResolver';
import { Client } from 'common/interfaces/client';
import { Vendor } from 'common/interfaces/vendor';

import {
  MailerResource,
  MailerResourceType,
} from 'pages/invoices/email/components/Mailer';
import { useEffect, useState } from 'react';

interface Props {
  resource: MailerResource;
  resourceType: MailerResourceType;
}

export function Contact(props: Props) {
  const clientResolver = useClientResolver();
  const vendorResolver = useVendorResolver();

  const [relation, setRelation] = useState<Vendor | Client>();

  useEffect(() => {
    if (
      props.resourceType === 'purchase_order' &&
      props.resource.vendor_id.length >= 1
    ) {
      vendorResolver
        .find(props.resource.vendor_id)
        .then((vendor) => setRelation(vendor));
    }

    if (
      props.resourceType !== 'purchase_order' &&
      props.resource.client_id.length >= 1
    ) {
      clientResolver
        .find(props.resource.client_id)
        .then((client) => setRelation(client));
    }
  }, []);

  console.log(relation?.contacts);

  return (
    <>
      {relation && (
        <div>
          {relation.contacts.map((contact, index) => (
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

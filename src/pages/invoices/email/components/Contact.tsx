/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useResolveClientContact } from 'pages/clients/common/hooks/useResolveClientContact';

interface Props {
  contactId: string;
  clientId: string;
}

export function Contact(props: Props) {
  const resolveClientContact = useResolveClientContact(props.clientId);
  const contact = resolveClientContact(props.contactId);

  return (
    <>
      {contact && (
        <p>
          {contact?.first_name} {contact?.last_name} &#183;
          <span className="font-semibold"> {contact?.email}</span>
        </p>
      )}
    </>
  );
}

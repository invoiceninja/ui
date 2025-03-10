/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useOutletContext } from 'react-router-dom';
import { ClientContext } from '$app/pages/clients/edit/Edit';
import { Address } from '$app/pages/clients/edit/components/Address';
import { Details } from '$app/pages/clients/edit/components/Details';
import { Contacts } from '$app/pages/clients/edit/components/Contacts';

export default function CreatePage() {
  const context: ClientContext = useOutletContext();

  const { client, setClient, errors, setErrors, contacts, setContacts } =
    context;

  return (
    <div className="flex flex-col xl:flex-row xl:gap-4">
      <div className="w-full xl:w-1/2">
        <Details
          client={client}
          setClient={setClient}
          setErrors={setErrors}
          errors={errors}
        />
      </div>

      <div className="w-full xl:w-1/2">
        <Contacts
          contacts={contacts}
          setContacts={setContacts}
          setErrors={setErrors}
          errors={errors}
        />

        <Address
          client={client}
          setClient={setClient}
          setErrors={setErrors}
          errors={errors}
        />
      </div>
    </div>
  );
}

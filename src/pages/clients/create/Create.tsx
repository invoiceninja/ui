/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdditionalInfo } from '../edit/components/AdditionalInfo';
import { Address } from '../edit/components/Address';
import { Contacts } from '../edit/components/Contacts';
import { Details } from '../edit/components/Details';
import { toast } from '$app/common/helpers/toast/toast';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { useTitle } from '$app/common/hooks/useTitle';
import { ValidationAlert } from '$app/components/ValidationAlert';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useBlankClientQuery } from '$app/common/queries/clients';

export default function Create() {
  const { documentTitle } = useTitle('new_client');

  const [t] = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const saveCompany = useHandleCompanySave();

  const pages: Page[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: t('new_client'),
      href: route('/clients/create'),
    },
  ];

  const [client, setClient] = useState<Client | undefined>();
  const [errors, setErrors] = useState<ValidationBag>();

  const [contacts, setContacts] = useState<Partial<ClientContact>[]>([
    {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      send_email: false,
    },
  ]);

  const { data: blankClient } = useBlankClientQuery({});

  useEffect(() => {
    if (blankClient) {
      setClient({
        ...blankClient.data,
        group_settings_id: searchParams.get('group') || '',
      });
    }
  }, [blankClient]);

  const onSave = async () => {
    set(client as Client, 'contacts', contacts);
    toast.processing();
    setErrors(undefined);

    if (
      !(
        client?.name != '' ||
        contacts[0].first_name != '' ||
        contacts[0].last_name != ''
      )
    ) {
      setErrors({
        message: t('invalid_name // needs translation'),
        errors: { name: [t('please_enter_a_client_or_contact_name')] },
      });
      toast.error();

      return onSave;
    }

    await saveCompany(true);

    request('POST', endpoint('/api/v1/clients'), client)
      .then((response) => {
        toast.success('created_client');

        $refetch(['clients']);

        navigate(route('/clients/:id', { id: response.data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      });
  };

  return (
    <Default title={documentTitle} breadcrumbs={pages} onSaveClick={onSave}>
      {errors ? (
        <ValidationAlert
          errors={errors}
          entity="client"
          withoutTopMessage={Boolean(errors.errors?.id)}
          withoutListBullets={Boolean(errors.errors?.id)}
        />
      ) : null}

      <div className="flex flex-col xl:flex-row xl:gap-4">
        <div className="w-full xl:w-1/2">
          <Details
            client={client}
            setClient={setClient}
            setErrors={setErrors}
            errors={errors}
          />

          <div className="mt-5">
            <Address
              client={client}
              setClient={setClient}
              setErrors={setErrors}
              errors={errors}
            />
          </div>
        </div>

        <div className="w-full xl:w-1/2">
          <Contacts
            contacts={contacts}
            setContacts={setContacts}
            setErrors={setErrors}
            errors={errors}
          />

          <div className="mt-5">
            <AdditionalInfo
              client={client}
              setClient={setClient}
              setErrors={setErrors}
              errors={errors}
            />
          </div>
        </div>
      </div>
    </Default>
  );
}

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
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useClientQuery } from '$app/common/queries/clients';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { cloneDeep, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useActions } from '../common/hooks/useActions';
import { AdditionalInfo } from './components/AdditionalInfo';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';

export default function Edit() {
  const { documentTitle, setDocumentTitle } = useTitle('edit_client');
  const { id } = useParams();

  const [t] = useTranslation();
  const navigate = useNavigate();

  const [isPurgeOrMergeActionCalled, setIsPurgeOrMergeActionCalled] =
    useState<boolean>(false);

  const actions = useActions({
    setIsPurgeOrMergeActionCalled,
  });

  const { data, isLoading } = useClientQuery({
    id,
    enabled: !isPurgeOrMergeActionCalled,
  });

  const [contacts, setContacts] = useState<Partial<ClientContact>[]>([]);
  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

  useEffect(() => {
    if (data) {
      setClient({ ...data });

      const contacts = cloneDeep(data.contacts);

      contacts.map((contact) => (contact.password = ''));

      setContacts(contacts);
    }

    return () => {
      setIsPurgeOrMergeActionCalled(false);
    };
  }, [data]);

  useEffect(() => {
    setDocumentTitle(client?.display_name || 'edit_client');
  }, [client]);

  useEffect(() => {
    setClient((client) => set(client as Client, 'contacts', contacts));
  }, [contacts]);

  const pages: Page[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: route('/clients/:id', { id }),
    },
    {
      name: t('edit'),
      href: route('/clients/:id', { id }),
    },
  ];

  const saveCompany = useHandleCompanySave();

  const onSave = async () => {
    toast.processing();

    await saveCompany(true);

    request('PUT', endpoint('/api/v1/clients/:id', { id }), {
      ...client,
      documents: [],
    })
      .then(() => {
        toast.success('updated_client');

        $refetch(['clients']);

        navigate(route('/clients/:id', { id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }

        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
        }
      });
  };

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={onSave}
      navigationTopRight={
        client && (
          <ResourceActions
            label={t('more_actions')}
            resource={client}
            actions={actions}
            cypressRef="clientActionDropdown"
          />
        )
      }
    >
      {isLoading && <Spinner />}

      {client && (
        <div className="flex flex-col xl:flex-row xl:space-x-4">
          <div className="flex flex-col w-full xl:w-1/2 space-y-4">
            <Details
              client={client}
              setClient={setClient}
              setErrors={setErrors}
              errors={errors}
              page="edit"
            />
            <Address
              client={client}
              setClient={setClient}
              setErrors={setErrors}
              errors={errors}
            />
          </div>

          <div className="flex flex-col w-full xl:w-1/2 space-y-4">
            <Contacts
              contacts={contacts}
              setContacts={setContacts}
              setErrors={setErrors}
              errors={errors}
            />
            <AdditionalInfo
              client={client}
              setClient={setClient}
              setErrors={setErrors}
              errors={errors}
            />
          </div>

          <ChangeTemplateModal<Client>
            entity="client"
            entities={changeTemplateResources as Client[]}
            visible={changeTemplateVisible}
            setVisible={setChangeTemplateVisible}
            labelFn={(client) => `${t('number')}: ${client.number}`}
            bulkUrl="/api/v1/clients/bulk"
          />
        </div>
      )}
    </Default>
  );
}

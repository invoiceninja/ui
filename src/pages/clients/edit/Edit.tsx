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
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { cloneDeep, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { MergeClientModal } from '../common/components/MergeClientModal';
import { useActions } from '../common/hooks/useActions';
import { usePurgeClient } from '../common/hooks/usePurgeClient';
import { AdditionalInfo } from './components/AdditionalInfo';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { toast } from '$app/common/helpers/toast/toast';

export default function Edit() {
  const { documentTitle, setDocumentTitle } = useTitle('edit_client');
  const { id } = useParams();

  const [t] = useTranslation();

  const navigate = useNavigate();

  const { data, isLoading } = useClientQuery({ id, enabled: true });

  const queryClient = useQueryClient();

  const [contacts, setContacts] = useState<Partial<ClientContact>[]>([]);
  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);

  const onPasswordConformation = usePurgeClient(id);

  useEffect(() => {
    if (data) {
      setClient({ ...data });

      const contacts = cloneDeep(data.contacts);

      contacts.map((contact) => (contact.password = ''));

      setContacts(contacts);
    }
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

        queryClient.invalidateQueries('/api/v1/clients');

        queryClient.invalidateQueries(route('/api/v1/clients/:id', { id }));

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

  const actions = useActions({
    setIsMergeModalOpen,
    setPasswordConfirmModalOpen,
  });

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
          />
        )
      }
    >
      {isLoading && <Spinner />}

      {client && (
        <div className="flex flex-col xl:flex-row xl:gap-4">
          <div className="w-full xl:w-1/2">
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

          <div className="w-full xl:w-1/2">
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
        </div>
      )}

      {id && (
        <MergeClientModal
          visible={isMergeModalOpen}
          setVisible={setIsMergeModalOpen}
          mergeFromClientId={id}
          editPage
        />
      )}

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={onPasswordConformation}
      />
    </Default>
  );
}

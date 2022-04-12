/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { ClientContact } from 'common/interfaces/client-contact';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useClientQuery } from 'common/queries/clients';
import { defaultHeaders } from 'common/queries/common/headers';
import { updateRecord } from 'common/stores/slices/company-users';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { Spinner } from 'components/Spinner';
import { ValidationAlert } from 'components/ValidationAlert';
import { set } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { CustomResourcefulActions } from '../common/components/CustomResourcefulActions';
import { usePurgeClient } from '../common/hooks/usePurgeClient';
import { AdditionalInfo } from './components/AdditionalInfo';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';

export function Edit() {
  const { documentTitle, setDocumentTitle } = useTitle('edit_client');
  const { id } = useParams();
  const [t] = useTranslation();
  const navigate = useNavigate();
  const company = useInjectCompanyChanges();
  const dispatch = useDispatch();
  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);
  const { data, isLoading } = useClientQuery(
    { id },
    { refetchOnWindowFocus: false }
  );
  const queryClient = useQueryClient();
  const [contacts, setContacts] = useState<Partial<ClientContact>[]>([]);
  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();
  const onPasswordConformation = usePurgeClient(id);

  useEffect(() => {
    if (data?.data?.data) {
      setClient(data.data.data);
      setContacts(data.data.data.contacts);
    }
  }, [data]);

  useEffect(() => {
    setDocumentTitle(client?.display_name || 'edit_client');
  }, [client]);

  useEffect(() => {
    setClient((client) => set(client as Client, 'contacts', contacts));
  }, [contacts]);

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: generatePath('/clients/:id', { id }),
    },
  ];

  const onSave = () => {
    const toastId = toast.loading(t('processing'));

    axios
      .all([
        axios.put(endpoint('/api/v1/clients/:id', { id }), client, {
          headers: defaultHeaders,
        }),
        axios.put(
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company,
          { headers: defaultHeaders }
        ),
      ])
      .then((response) => {
        dispatch(
          updateRecord({ object: 'company', data: response[1].data.data })
        );

        toast.success(t('updated_client'), { id: toastId });

        navigate(generatePath('/clients/:id', { id }));
      })
      .catch((error: AxiosError) => {
        console.error(error);

        if (error.response?.status === 422) {
          setErrors(error.response.data);
        }

        error.response?.status === 412
          ? toast.error(t('password_error_incorrect'), { id: toastId })
          : toast.error(t('error_title'), { id: toastId });
      })
      .finally(() =>
        queryClient.invalidateQueries(
          generatePath('/api/v1/clients/:id', { id })
        )
      );
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        <CustomResourcefulActions
          clientId={id}
          openPurgeModal={setPasswordConfirmModalOpen}
        />
      }
      onBackClick={generatePath('/clients/:id', { id })}
      onSaveClick={onSave}
    >
      {isLoading && <Spinner />}

      {errors && <ValidationAlert errors={errors} />}

      {client && (
        <div className="flex flex-col xl:flex-row xl:gap-4">
          <div className="w-full xl:w-1/2">
            <Details client={client} setClient={setClient} errors={errors} />
            <Address client={client} setClient={setClient} />
          </div>

          <div className="w-full xl:w-1/2">
            <Contacts
              contacts={contacts}
              setContacts={setContacts}
              errors={errors}
            />
            <AdditionalInfo client={client} setClient={setClient} />
          </div>
        </div>
      )}

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={onPasswordConformation}
      />
    </Default>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useHandleChange } from '../common/hooks/useHandleChange';
import { Form } from '../common/components/Form';
import { useClientQuery } from '$app/common/queries/docuninja/clients';

interface Payload {
  name: string;
}

export default function Edit() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { id } = useParams();

  const pages: Page[] = [
    { name: t('documents'), href: '/documents' },
    {
      name: t('clients'),
      href: route('/documents/clients'),
    },
    {
      name: t('edit_client'),
      href: route('/documents/clients/:id/edit', { id }),
    },
  ];

  const { data: clientResponse, isLoading } = useClientQuery({ id });

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [errors, setErrors] = useState<ValidationBag | undefined>(undefined);

  const handleChange = useHandleChange({
    setClient,
  });

  const handleEdit = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request('PUT', docuNinjaEndpoint('/api/clients/:id', { id }), client, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      })
        .then(() => {
          toast.success('updated_client');

          $refetch(['docuninja_clients']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (clientResponse) {
      setClient(clientResponse);
    }
  }, [clientResponse]);

  return (
    <Default
      title={t('edit_client')}
      breadcrumbs={pages}
      onSaveClick={handleEdit}
      disableSaveButton={isFormBusy || isLoading || !client}
    >
      <Form
        client={client}
        errors={errors}
        handleChange={handleChange}
        setErrors={setErrors}
        isLoading={isLoading}
      />
    </Default>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Payload {
  description: string;
}

export default function Create() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const colors = useColorScheme();

  const pages: Page[] = [
    { name: t('documents'), href: '/documents' },
    {
      name: t('new_document'),
      href: route('/documents/create'),
    },
  ];

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | undefined>(undefined);
  const [payload, setPayload] = useState<Payload>({
    description: '',
  });

  const handleCreate = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request('POST', docuNinjaEndpoint('/api/documents'), payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      })
        .then((response: GenericSingleResourceResponse<Document>) => {
          toast.success('created_document');

          $refetch(['docuninja_documents']);

          setPayload({
            description: '',
          });

          navigate(route('/documents/:id', { id: response.data.data.id }));
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

  return (
    <Default
      title={t('new_document')}
      breadcrumbs={pages}
      onSaveClick={handleCreate}
      disableSaveButton={isFormBusy}
    >
      <div className="flex justify-center">
        <Card
          title={t('new_document')}
          className="shadow-sm w-full xl:w-1/2"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <Element leftSide={t('name')}>
            <InputField
              value={payload.description}
              onValueChange={(value) =>
                setPayload({ ...payload, description: value })
              }
              errorMessage={errors?.errors.description}
            />
          </Element>
        </Card>
      </div>
    </Default>
  );
}

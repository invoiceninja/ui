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
import { Badge } from '$app/components/Badge';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DocumentCreationDropZone } from '../common/components/DocumentCreationDropZone';
import { X } from 'react-feather';

interface Payload {
  description: string;
  'files[]': File[];
}

export default function Create() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const colors = useColorScheme();

  const pages: Page[] = [
    { name: t('docuninja'), href: '/docuninja' },
    {
      name: t('new_document'),
      href: route('/docuninja/create'),
    },
  ];

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | undefined>(undefined);
  const [payload, setPayload] = useState<Payload>({
    description: 'Untitled document',
    'files[]': [],
  });

  const handleCreate = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);
      setIsFormBusy(true);

      const formData = new FormData();

      formData.append('description', payload.description);

      payload['files[]'].forEach((file) => {
        formData.append('files[]', file);
      });

      request('POST', docuNinjaEndpoint('/api/documents'), formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      })
        .then((response: GenericSingleResourceResponse<Document>) => {
          toast.success('document_created');

          $refetch(['docuninja_documents']);

          setPayload({
            description: '',
            'files[]': [],
          });

          navigate(
            route('/docuninja/:id/builder', { id: response.data.data.id })
          );
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

  const handleRemoveFile = (index: number) => {
    const updatedFiles = payload['files[]'].filter((_, i) => i !== index);
    setPayload({ ...payload, 'files[]': updatedFiles });
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

          <Element>
            <DocumentCreationDropZone
              onSelectFiles={(f) => setPayload({ ...payload, 'files[]': f })}
            />
          </Element>

          {payload['files[]'].length > 0 && (
            <Element leftSide={t('files')}>
              <div className="flex flex-wrap gap-2">
                {payload['files[]'].map((file, index) => (
                  <Badge key={index} variant="blue">
                    <div className="flex items-center gap-2">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="hover:opacity-70 transition-opacity"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </Badge>
                ))}
              </div>
            </Element>
          )}
        </Card>
      </div>
    </Default>
  );
}

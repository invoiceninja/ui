/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  blobToBase64,
  createAuthoredDocumentData,
  renderAuthoredDocumentPdf,
} from '@docuninja/builder2.0';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CardContainer, Element } from '$app/components/cards';
import { Button, InputField } from '$app/components/forms';

interface AuthoredBlueprintStepProps {
  onComplete: (blueprintId: string) => void;
  onBack: () => void;
}

export function AuthoredBlueprintStep({
  onComplete,
  onBack,
}: AuthoredBlueprintStepProps) {
  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag | undefined>();
  const [payload, setPayload] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  function handleCreateBlueprint() {
    setErrors(undefined);
    setIsCreating(true);
    const editorData = createAuthoredDocumentData();

    renderAuthoredDocumentPdf(editorData)
      .then(blobToBase64)
      .then((base64File) =>
        request(
          'POST',
          docuNinjaEndpoint('/api/blueprints'),
          {
            ...payload,
            is_template: true,
            template_kind: 'authored_document',
            grapesjs: editorData,
            base64_file: base64File,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                'X-DOCU-NINJA-TOKEN'
              )}`,
            },
          }
        )
      )
      .then((response: GenericSingleResourceResponse<Document>) => {
        toast.success('template_created');
        $refetch(['blueprints']);
        onComplete(response.data.data.id);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          toast.error('Error creating document template');
        }
      })
      .finally(() => setIsCreating(false));
  }

  return (
    <CardContainer>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Create document</h2>
        <p className="text-gray-600">
          Compose a flowing document and place signing widgets alongside its
          content.
        </p>
      </div>

      <Element leftSide={t('name')}>
        <InputField
          value={payload.name}
          onValueChange={(name) => setPayload({ ...payload, name })}
          errorMessage={errors?.errors.name}
          placeholder={t('template_name')}
        />
      </Element>

      <Element leftSide={t('description')}>
        <InputField
          element="textarea"
          value={payload.description}
          onValueChange={(description) =>
            setPayload({ ...payload, description })
          }
          errorMessage={errors?.errors.description}
          placeholder={t('description')}
        />
      </Element>

      <div className="flex justify-between">
        <Button type="primary" onClick={onBack} behavior="button">
          {t('back')}
        </Button>
        <Button
          behavior="button"
          type="primary"
          onClick={handleCreateBlueprint}
          disabled={isCreating}
        >
          {t('create_template')}
         </Button>
      </div>
    </CardContainer>
  );
}


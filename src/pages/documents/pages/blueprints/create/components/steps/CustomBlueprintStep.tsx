/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Button } from '$app/components/forms';
import { InputField } from '$app/components/forms';
import { Element } from '$app/components/cards';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { docuNinjaEndpoint } from '$app/common/helpers';
interface CustomBlueprintStepProps {
  onComplete: (blueprintId: string) => void;
  onBack: () => void;
}

interface Payload {
  name: string;
  description: string;
}

export function CustomBlueprintStep({ onComplete, onBack }: CustomBlueprintStepProps) {
  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag | undefined>(undefined);
  const [payload, setPayload] = useState<Payload>({
    name: '',
    description: '',
  });

  function handleCreateBlueprint() {
    if (!payload.name.trim()) return;

    setErrors(undefined);

     request(
        'POST',
        docuNinjaEndpoint('/api/blueprints'),
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then((response: GenericSingleResourceResponse<Document>) =>{

          toast.success('blueprint_created');
          $refetch(['blueprints']);
          
          onComplete(response.data.data.id);

      }).catch((error: AxiosError<ValidationBag>) => {
      
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
        else {
          toast.error('Error creating blueprint:');
        }

      });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{t('create_your_own')}</h2>
        <p className="text-gray-600">{t('create_your_own_description')}</p>
      </div>

      <Element leftSide={t('name')}>
        <InputField
          value={payload.name}
          onValueChange={(value) => setPayload({ ...payload, name: value })}
          errorMessage={errors?.errors.name}
          placeholder={t('blueprint_name')}
        />
      </Element>

      <Element leftSide={t('description')}>
        <InputField
          element="textarea"
          value={payload.description}
          onValueChange={(value) => setPayload({ ...payload, description: value })}
          errorMessage={errors?.errors.description}
          placeholder={t('description')}
        />
      </Element>

      <div className="flex justify-between p-6">
        <Button 
          type="primary"
          onClick={onBack}>
          {t('back')}
        </Button>
        <Button
          type="primary"
          onClick={handleCreateBlueprint}
        >
          {t('create_blueprint')}
        </Button>
      </div>
    </div>
  );
}

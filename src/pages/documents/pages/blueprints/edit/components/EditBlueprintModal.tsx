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
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '$app/components/forms';

interface Props {
  blueprint: Blueprint;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBlueprintModal({ blueprint, isOpen, onClose }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [formData, setFormData] = useState({
    name: blueprint?.name || '',
    description: blueprint?.description || '',
  });
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | undefined>(undefined);

  const handleSave = () => {
    if (!isFormBusy && blueprint) {
      toast.processing();

      setErrors(undefined);
      setIsFormBusy(true);

      request(
        'PUT',
        docuNinjaEndpoint('/api/blueprints/:id', { id: blueprint.id }),
        {
          ...blueprint,
          name: formData.name,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then((response: GenericSingleResourceResponse<Blueprint>) => {
          toast.success('template_updated');
          $refetch(['blueprints']);
          onClose();
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

  const handleClose = () => {
    if (!isFormBusy) {
      setFormData({
        name: blueprint?.name || '',
        description: blueprint?.description || '',
      });
      setErrors(undefined);
      onClose();
    }
  };

  return (
    <Modal
      title={t('edit_template')}
      visible={isOpen}
      onClose={handleClose}
      size="regular"
    >
      <div className="space-y-4">
        <div>
          <InputField
            label={t('name')}
            value={formData.name}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, name: value }))
            }
            errorMessage={errors?.errors.name}
            disabled={isFormBusy}
          />
        </div>

        <div>
          <InputField
            label={t('description')}
            value={formData.description}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
            errorMessage={errors?.errors.description}
            disabled={isFormBusy}
            element="textarea"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
        <Button 
            type="secondary"
            onClick={handleClose}
            disabled={isFormBusy}
          >
            {t('cancel')}
          </Button>
          <Button 
            type="primary"
            onClick={handleSave}
            disabled={isFormBusy || !formData.name.trim()}
          >
            {isFormBusy ? t('processing') : t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

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
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Button, InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Payload {
  description: string;
}

export function CreateDocumentModal() {
  const [t] = useTranslation();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | undefined>(undefined);
  const [payload, setPayload] = useState<Payload>({
    description: '',
  });

  const handleClose = () => {
    setIsModalOpen(false);

    setPayload({
      description: '',
    });
  };

  const handleCreate = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request('POST', docuNinjaEndpoint('/api/documents'), payload)
        .then((response: GenericSingleResourceResponse<Document>) => {
          toast.success('created_document');

          $refetch(['documents']);

          console.log(response);

          handleClose();
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
    <>
      <Button behavior="button" onClick={() => setIsModalOpen(true)}>
        {t('create')}
      </Button>

      <Modal
        title={t('create_document')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <InputField
          label={t('document_name')}
          value={payload.description}
          onValueChange={(value) =>
            setPayload({ ...payload, description: value })
          }
          errorMessage={errors?.errors.description}
        />

        <Button
          behavior="button"
          onClick={handleCreate}
          disabled={isFormBusy || !payload.description.length}
          disableWithoutIcon={!payload.description.length}
        >
          {t('create')}
        </Button>
      </Modal>
    </>
  );
}

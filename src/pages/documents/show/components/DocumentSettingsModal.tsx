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
import { Document, DocumentStatus } from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Button, InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface Props {
  document: Document;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

interface Payload {
  description: string;
  expires_at: string | undefined;
}

export function DocumentSettingsModal({
  document,
  visible,
  setVisible,
}: Props) {
  const [t] = useTranslation();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);

  const [payload, setPayload] = useState<Payload>({
    description: document.description,
    expires_at: document.expires_at ?? undefined,
  });

  const handleSubmit = () => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      request(
        'PUT',
        docuNinjaEndpoint(`/api/documents/${document.id}`),
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then(() => {
          $refetch(['docuninja_documents']);

          toast.success('updated_settings');

          setErrors(null);
          setVisible(false);
        })
        .catch((e) => {
          if (e.response?.status === 422) {
            setErrors(e.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Modal
      title={t('options')}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <InputField
        label={t('description')}
        value={payload.description}
        onValueChange={(value) =>
          setPayload({ ...payload, description: value })
        }
        errorMessage={errors?.errors.description}
      />

    {document.status_id <= DocumentStatus.Sent && (
      <InputField
        type="date"
        label={t('expiry_date')}
        value={payload.expires_at}
        onValueChange={(value) => setPayload({ ...payload, expires_at: value })}
        errorMessage={errors?.errors.expires_at}
      />
    )}
      <Button behavior="button" disabled={isFormBusy} onClick={handleSubmit}>
        {t('save')}
      </Button>
    </Modal>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction } from 'react';
import { Button, InputField, InputLabel } from '$app/components/forms';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useTitle } from '$app/common/hooks/useTitle';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useHandleChange } from '../common/hooks';
import { useBlankTaskStatusQuery } from '$app/common/queries/task-statuses';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function CreateTaskStatusModal(props: Props) {
  useTitle('kanban');

  const [t] = useTranslation();

  const accentColor = useAccentColor();

  const queryClient = useQueryClient();

  const { data: blankTaskStatus } = useBlankTaskStatusQuery();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [taskStatus, setTaskStatus] = useState<TaskStatus>();

  const handleChange = useHandleChange({
    setErrors,
    setTaskStatus,
  });

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/task_statuses'), taskStatus)
        .then(() => {
          toast.success('created_task_status');

          queryClient.invalidateQueries('/api/v1/task_statuses');

          setTaskStatus(blankTaskStatus);

          props.setVisible(false);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          toast.dismiss();
          console.error(error);

          error.response?.status === 422
            ? setErrors(error.response.data)
            : toast.error();
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (blankTaskStatus) {
      setTaskStatus(blankTaskStatus);
    }
  }, [blankTaskStatus]);

  return (
    <Modal
      title={t('new_task_status')}
      visible={props.visible}
      onClose={() => {
        props.setVisible(false);
        setTaskStatus(blankTaskStatus);
      }}
    >
      <InputField
        required
        label={t('name')}
        value={taskStatus?.name}
        onValueChange={(value) => handleChange('name', value)}
        errorMessage={errors?.errors.name}
      />

      <InputLabel>{t('color')}</InputLabel>
      <ColorPicker
        value={taskStatus?.color || accentColor}
        onValueChange={(color) => handleChange('color', color)}
      />

      <Button className="self-end" disabled={isFormBusy} onClick={handleSave}>
        {t('save')}
      </Button>
    </Modal>
  );
}

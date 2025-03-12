/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Button, InputField, InputLabel } from '../forms';
import { ColorPicker } from '../forms/ColorPicker';
import { ComboboxAsync, Entry } from '../forms/Combobox';
import { useEffect, useState } from 'react';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankTaskStatusQuery } from '$app/common/queries/task-statuses';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { toast } from '$app/common/helpers/toast/toast';
import { AxiosError } from 'axios';
import { $refetch } from '$app/common/hooks/useRefetch';
import { request } from '$app/common/helpers/request';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';

export function TaskStatusSelector(props: GenericSelectorProps<TaskStatus>) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();

  const { isAdmin, isOwner } = useAdmin();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [taskStatus, setTaskStatus] = useState<TaskStatus>();
  const [errors, setErrors] = useState<ValidationBag>();

  const { data: taskStatusResponse } = useBlankTaskStatusQuery({
    enabled: isModalVisible,
  });

  const handleCreateTaskStatus = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/task_statuses'), taskStatus)
        .then((response: GenericSingleResourceResponse<TaskStatus>) => {
          toast.success('created_task_status');

          $refetch(['task_statuses']);

          setTaskStatus(taskStatusResponse);

          props.onChange(response.data.data);

          setIsModalVisible(false);
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
    if (taskStatusResponse) {
      setTaskStatus(taskStatusResponse);
    }
  }, [taskStatusResponse]);

  return (
    <>
      <Modal
        title={t('new_task_status')}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setTaskStatus(taskStatusResponse);
        }}
      >
        <InputField
          required
          label={t('name')}
          value={taskStatus?.name}
          onValueChange={(value) =>
            setTaskStatus((current) => current && { ...current, name: value })
          }
          errorMessage={errors?.errors.name}
        />

        <InputLabel>{t('color')}</InputLabel>
        <ColorPicker
          value={taskStatus?.color || accentColor}
          onValueChange={(value) =>
            setTaskStatus((current) => current && { ...current, color: value })
          }
        />

        <Button
          className="self-end"
          behavior="button"
          onClick={handleCreateTaskStatus}
        >
          {t('save')}
        </Button>
      </Modal>

      <ComboboxAsync<TaskStatus>
        endpoint={endpoint('/api/v1/task_statuses?status=active')}
        onChange={(taskStatus: Entry<TaskStatus>) =>
          taskStatus.resource && props.onChange(taskStatus.resource)
        }
        inputOptions={{
          label: props.inputLabel?.toString(),
          value: props.value || null,
        }}
        entryOptions={{
          id: 'id',
          label: 'name',
          value: 'id',
        }}
        action={{
          label: t('new_task_status'),
          onClick: () => setIsModalVisible(true),
          visible: isAdmin || isOwner,
        }}
        onDismiss={props.onClearButtonClick}
        readonly={props.readonly}
        errorMessage={props.errorMessage}
      />
    </>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer, Element } from '$app/components/cards';
import { InputField, InputLabel } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTaskStatusQuery } from '$app/common/queries/task-statuses';
import { Badge } from '$app/components/Badge';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Settings } from '$app/components/layouts/Settings';
import { Spinner } from '$app/components/Spinner';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  useActions,
  useHandleChange,
} from '$app/pages/settings/task-statuses/common/hooks';
import { ResourceActions } from '$app/components/ResourceActions';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useColorScheme } from '$app/common/colors';

export function Edit() {
  const [t] = useTranslation();

  const { id } = useParams();

  const actions = useActions();
  const colors = useColorScheme();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('task_settings'), href: '/settings/task_settings' },
    {
      name: t('edit_task_status'),
      href: route('/settings/task_statuses/:id/edit', { id }),
    },
  ];

  const { data: taskStatusData } = useTaskStatusQuery({ id });

  const [errors, setErrors] = useState<ValidationBag>();
  const { documentTitle, setDocumentTitle } = useTitle('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isTitleApplied, setIsTitleApplied] = useState<boolean>(false);

  const handleChange = useHandleChange({ setErrors, setTaskStatus });

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request('PUT', endpoint('/api/v1/task_statuses/:id', { id }), taskStatus)
        .then(() => {
          toast.success('updated_task_status');

          $refetch(['task_statuses']);

          setIsTitleApplied(false);
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
    if (taskStatusData) {
      setTaskStatus(taskStatusData.data.data);
    }
  }, [taskStatusData]);

  useEffect(() => {
    if (taskStatus && !isTitleApplied) {
      setDocumentTitle(taskStatus.name);
      setIsTitleApplied(true);
    }
  }, [taskStatus]);

  return (
    <Settings
      title={t('task_statuses')}
      navigationTopRight={
        taskStatus && (
          <ResourceActions
            label={t('actions')}
            resource={taskStatus}
            actions={actions}
          />
        )
      }
      breadcrumbs={pages}
    >
      {!taskStatus && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {taskStatus && (
        <Card
          title={documentTitle}
          className="shadow-sm"
          childrenClassName="pt-4"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
          withoutBodyPadding
          withSaveButton
          disableSubmitButton={isFormBusy}
          onSaveClick={(event) => handleSave(event)}
          onFormSubmit={(event) => handleSave(event)}
        >
          <Element leftSide={t('status')}>
            {!taskStatus.is_deleted && !taskStatus.archived_at && (
              <Badge variant="primary">{t('active')}</Badge>
            )}

            {taskStatus.archived_at && !taskStatus.is_deleted ? (
              <Badge variant="yellow">{t('archived')}</Badge>
            ) : null}

            {taskStatus.is_deleted && (
              <Badge variant="red">{t('deleted')}</Badge>
            )}
          </Element>

          <CardContainer>
            <InputField
              required
              label={t('name')}
              value={taskStatus.name}
              onValueChange={(value) => handleChange('name', value)}
              errorMessage={errors?.errors?.name}
            />

            <div>
              <InputLabel className="mb-1">{t('color')}</InputLabel>

              <ColorPicker
                value={taskStatus.color}
                onValueChange={(value) => handleChange('color', value)}
              />
            </div>
          </CardContainer>
        </Card>
      )}
    </Settings>
  );
}

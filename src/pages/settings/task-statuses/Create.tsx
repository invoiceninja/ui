/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ButtonOption, Card, CardContainer } from '$app/components/cards';
import { InputField, InputLabel } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useTitle } from '$app/common/hooks/useTitle';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankTaskStatusQuery } from '$app/common/queries/task-statuses';
import { Breadcrumbs } from '$app/components/Breadcrumbs';
import { Container } from '$app/components/Container';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Icon } from '$app/components/icons/Icon';
import { Settings } from '$app/components/layouts/Settings';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useHandleChange } from './common/hooks';

export function Create() {
  const { documentTitle } = useTitle('new_task_status');

  const [t] = useTranslation();

  const navigate = useNavigate();

  const accentColor = useAccentColor();

  const queryClient = useQueryClient();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('task_settings'), href: '/settings/task_settings' },
    { name: t('new_task_status'), href: '/settings/task_statuses/create' },
  ];

  const { data: blankTaskStatus } = useBlankTaskStatusQuery();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [taskStatus, setTaskStatus] = useState<TaskStatus>();

  const handleChange = useHandleChange({
    setErrors,
    setTaskStatus,
  });

  const handleSave = (
    event: FormEvent<HTMLFormElement>,
    actionType: string
  ) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/task_statuses'), taskStatus)
        .then((response) => {
          toast.success('created_task_status');

          queryClient.invalidateQueries('/api/v1/task_statuses');

          if (actionType === 'save') {
            navigate(
              route('/settings/task_statuses/:id/edit', {
                id: response.data.data.id,
              })
            );
          } else {
            setTaskStatus(blankTaskStatus);
          }
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
    if (blankTaskStatus) {
      setTaskStatus(blankTaskStatus);
    }
  }, [blankTaskStatus]);

  const saveOptions: ButtonOption[] = [
    {
      onClick: (event: FormEvent<HTMLFormElement>) =>
        handleSave(event, 'create'),
      text: `${t('save')} / ${t('create')}`,
      icon: <Icon element={BiPlusCircle} />,
    },
  ];

  return (
    <Settings title={t('task_statuses')}>
      <Container className="space-y-6">
        <Breadcrumbs pages={pages} />

        <Card
          title={documentTitle}
          withSaveButton
          disableSubmitButton={isFormBusy}
          onSaveClick={(event) => handleSave(event, 'save')}
          additionalSaveOptions={saveOptions}
        >
          <CardContainer>
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
          </CardContainer>
        </Card>
      </Container>
    </Settings>
  );
}

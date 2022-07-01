/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { Project } from 'common/interfaces/project';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useProjectQuery } from 'common/queries/projects';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';

export function Edit() {
  const [t] = useTranslation();

  const { id } = useParams();
  const { data } = useProjectQuery({ id });

  const [project, setProject] = useState<Project>();
  const [errors, setErrors] = useState<ValidationBag>();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (data) {
      setProject({ ...data });
    }
  }, [data]);

  const handleChange = (property: keyof Project, value: unknown) => {
    setProject((project) => project && { ...project, [property]: value });
  };

  const onSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const toastId = toast.loading(t('processing'));

    setErrors(undefined);

    request('PUT', endpoint('/api/v1/projects/:id', { id }), project)
      .then(() => {
        toast.success(t('updated_project'), { id: toastId });

        queryClient.invalidateQueries(
          generatePath('/api/v1/projects/:id', { id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);

        if (error.response?.status == 422) {
          setErrors(error.response.data);
        }

        toast.error(t('error_title'), { id: toastId });
      });
  };

  return (
    <Card title={t('edit_project')} withSaveButton onFormSubmit={onSave}>
      <Element leftSide={t('project_name')}>
        <InputField
          value={project?.name}
          onValueChange={(value) => handleChange('name', value)}
          errorMessage={errors?.errors.name}
        />
      </Element>

      <Element leftSide={t('project_number')}>
        <InputField
          value={project?.number}
          onValueChange={(value) => handleChange('number', value)}
          errorMessage={errors?.errors.number}
        />
      </Element>

      <Element leftSide={t('user')}>
        <DebouncedCombobox
          defaultValue={project?.user_id}
          endpoint="/api/v1/users"
          label="first_name"
          formatLabel={(resource) =>
            `${resource.first_name} ${resource.last_name}`
          }
          onChange={(value) => handleChange('user_id', value.value)}
          clearButton={Boolean(project?.user_id)}
          onClearButtonClick={() => handleChange('user_id', '')}
          errorMessage={errors?.errors.user_id}
          queryAdditional
          disabled
        />
      </Element>

      <Element leftSide={t('due_date')}>
        <InputField
          type="date"
          value={project?.due_date}
          onValueChange={(value) => handleChange('due_date', value)}
          errorMessage={errors?.errors.due_date}
        />
      </Element>

      <Element leftSide={t('budgeted_hours')}>
        <InputField
          value={project?.budgeted_hours}
          onValueChange={(value) => handleChange('budgeted_hours', value)}
          errorMessage={errors?.errors.budgeted_hours}
        />
      </Element>

      <Element leftSide={t('task_rate')}>
        <InputField
          value={project?.task_rate}
          onValueChange={(value) => handleChange('task_rate', value)}
          errorMessage={errors?.errors.task_rate}
        />
      </Element>

      <Element leftSide={t('public_notes')}>
        <InputField
          element="textarea"
          value={project?.public_notes}
          onValueChange={(value) => handleChange('public_notes', value)}
          errorMessage={errors?.errors.public_notes}
        />
      </Element>

      <Element leftSide={t('private_notes')}>
        <InputField
          element="textarea"
          value={project?.private_notes}
          onValueChange={(value) => handleChange('private_notes', value)}
          errorMessage={errors?.errors.private_notes}
        />
      </Element>
    </Card>
  );
}

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
import { Project } from 'common/interfaces/project';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useProjectQuery } from 'common/queries/projects';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';

interface Context {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  project: Project;
  setProject: Dispatch<SetStateAction<Project | undefined>>;
}

export function Edit() {
  const [t] = useTranslation();

  const { id } = useParams();

  const { data } = useProjectQuery({ id });

  const context: Context = useOutletContext();

  const { errors, setErrors, project, setProject } = context;

  useEffect(() => {
    if (data) {
      setProject({ ...data });
    }
  }, [data]);

  const handleChange = (property: keyof Project, value: unknown) => {
    setErrors(undefined);
    setProject((project) => project && { ...project, [property]: value });
  };

  return (
    <Card title={t('edit_project')}>
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

      <Element leftSide={t('client')}>
        <DebouncedCombobox
          defaultValue={project?.client_id}
          endpoint="/api/v1/clients"
          label="display_name"
          onChange={(value) => handleChange('client_id', value.value)}
          clearButton={Boolean(project?.client_id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          errorMessage={errors?.errors.client_id}
          queryAdditional
          disabled
        />
      </Element>

      <Element leftSide={t('user')}>
        <DebouncedCombobox
          defaultValue={project?.assigned_user_id}
          endpoint="/api/v1/users"
          label="first_name"
          formatLabel={(resource) =>
            `${resource.first_name} ${resource.last_name}`
          }
          onChange={(value) => handleChange('assigned_user_id', value.value)}
          clearButton={Boolean(project?.assigned_user_id)}
          onClearButtonClick={() => handleChange('assigned_user_id', '')}
          errorMessage={errors?.errors.assigned_user_id}
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

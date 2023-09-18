/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { Project } from '$app/common/interfaces/project';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useProjectQuery } from '$app/common/queries/projects';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { UserSelector } from '$app/components/users/UserSelector';
import { EntityStatus } from '$app/components/EntityStatus';

interface Context {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  project: Project;
  setProject: Dispatch<SetStateAction<Project | undefined>>;
}

export default function Edit() {
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
      {project && (
        <Element leftSide={t('status')}>
          <EntityStatus entity={project} />
        </Element>
      )}

      <Element leftSide={t('project_name')} required>
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

      <Element leftSide={t('client')} required>
        <ClientSelector
          value={project?.client_id}
          onChange={(id) => handleChange('client_id', id)}
          readonly
          staleTime={Infinity}
        />
      </Element>

      <Element leftSide={t('user')}>
        <UserSelector
          value={project?.assigned_user_id}
          onChange={(user) => handleChange('assigned_user_id', user.id)}
          onClearButtonClick={() => handleChange('assigned_user_id', '')}
          errorMessage={errors?.errors.assigned_user_id}
          readonly
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
          type="number"
          value={project?.budgeted_hours || 0}
          onValueChange={(value) =>
            handleChange('budgeted_hours', parseFloat(value) || 0)
          }
          errorMessage={errors?.errors.budgeted_hours}
        />
      </Element>

      <Element leftSide={t('task_rate')}>
        <InputField
          type="number"
          value={project?.task_rate}
          onValueChange={(value) =>
            handleChange('task_rate', parseFloat(value) || 0)
          }
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

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Project } from '$app/common/interfaces/project';
import { TAG_ENTITY_TYPES } from '$app/common/interfaces/tag';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useProjectQuery } from '$app/common/queries/projects';
import { CustomField } from '$app/components/CustomField';
import { Card, Element } from '$app/components/cards';
import { EntityStatus } from '$app/components/EntityStatus';
import { InputField } from '$app/components/forms';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { TagPillSelector } from '$app/components/tags/TagPillSelector';
import { UserSelector } from '$app/components/users/UserSelector';
import { ClientActionButtons } from '$app/pages/invoices/common/components/ClientActionButtons';

interface Context {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  project: Project;
  setProject: Dispatch<SetStateAction<Project | undefined>>;
}

export default function Edit() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();
  const company = useCurrentCompany();

  const { data } = useProjectQuery({ id });

  const context: Context = useOutletContext();
  const { errors, setErrors, project, setProject } = context;

  const handleChange = (property: keyof Project, value: unknown) => {
    setErrors(undefined);
    setProject((project) => project && { ...project, [property]: value });
  };

  useEffect(() => {
    if (data) {
      setProject({ ...data });
    }
  }, [data]);

  return (
    <Card
      title={t('edit_project')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
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

      {project?.client && (
        <Element leftSide={t('client')} required>
          <ClientActionButtons displayClientName client={project.client} />
        </Element>
      )}

      <Element leftSide={t('assigned_user')}>
        <UserSelector
          value={project?.assigned_user_id}
          onChange={(user) => handleChange('assigned_user_id', user.id)}
          onClearButtonClick={() => handleChange('assigned_user_id', '')}
          errorMessage={errors?.errors.assigned_user_id}
        />
      </Element>

      <Element leftSide={t('tags')}>
        <TagPillSelector
          entityType={TAG_ENTITY_TYPES.project}
          value={project?.tags || []}
          onChange={(tags) => handleChange('tags', tags)}
          errorMessage={errors?.errors.tags}
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
        <NumberInputField
          value={project?.budgeted_hours || ''}
          onValueChange={(value) =>
            handleChange('budgeted_hours', parseFloat(value))
          }
          errorMessage={errors?.errors.budgeted_hours}
        />
      </Element>

      <Element leftSide={t('task_rate')}>
        <NumberInputField
          value={project?.task_rate || ''}
          onValueChange={(value) =>
            handleChange('task_rate', parseFloat(value))
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

      {project && company?.custom_fields?.project1 && (
        <CustomField
          field="project1"
          defaultValue={project.custom_value1 || ''}
          value={company.custom_fields.project1}
          onValueChange={(value) =>
            handleChange('custom_value1', value.toString())
          }
        />
      )}

      {project && company?.custom_fields?.project2 && (
        <CustomField
          field="project2"
          defaultValue={project.custom_value2 || ''}
          value={company.custom_fields.project2}
          onValueChange={(value) =>
            handleChange('custom_value2', value.toString())
          }
        />
      )}

      {project && company?.custom_fields?.project3 && (
        <CustomField
          field="project3"
          defaultValue={project.custom_value3 || ''}
          value={company.custom_fields.project3}
          onValueChange={(value) =>
            handleChange('custom_value3', value.toString())
          }
        />
      )}

      {project && company?.custom_fields?.project4 && (
        <CustomField
          field="project4"
          defaultValue={project.custom_value4 || ''}
          value={company.custom_fields.project4}
          onValueChange={(value) =>
            handleChange('custom_value4', value.toString())
          }
        />
      )}
    </Card>
  );
}

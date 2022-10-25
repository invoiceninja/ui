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
import { route } from 'common/helpers/route';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { Project } from 'common/interfaces/project';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankProjectQuery } from 'common/queries/projects';
import { Container } from 'components/Container';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { Default } from 'components/layouts/Default';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function Create() {
  const { documentTitle } = useTitle('new_project');

  const [t] = useTranslation();

  const pages = [
    { name: t('projects'), href: '/projects' },
    { name: t('new_project'), href: '/projects/create' },
  ];

  const { data: blankProject } = useBlankProjectQuery();

  const [project, setProject] = useState<Project>();
  const [errors, setErrors] = useState<ValidationBag>();

  const company = useCurrentCompany();
  const clientResolver = useClientResolver();
  const navigate = useNavigate();

  const handleChange = (property: keyof Project, value: unknown) => {
    setProject((project) => project && { ...project, [property]: value });
  };

  useEffect(() => {
    if (blankProject) {
      setProject({
        ...blankProject,
        task_rate: company?.settings.default_task_rate || 0,
      });
    }
  }, [blankProject]);

  useEffect(() => {
    if (project?.client_id && project.client_id.length > 1) {
      clientResolver.find(project.client_id).then((client) => {
        if (client.settings.default_task_rate) {
          handleChange('task_rate', client.settings.default_task_rate);
        }
      });
    }
  }, [project?.client_id]);

  const onSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const toastId = toast.loading(t('processing'));
    setErrors(undefined);

    request('POST', endpoint('/api/v1/projects'), project)
      .then((response) => {
        toast.success(t('created_project'), { id: toastId });

        navigate(route('/projects/:id/edit', { id: response.data.data.id }));
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
    <Default title={documentTitle} breadcrumbs={pages}>
      <Container>
        <Card title={documentTitle} withSaveButton onSaveClick={onSave}>
          <Element leftSide={t('project_name')}>
            <InputField
              value={project?.name}
              onValueChange={(value) => handleChange('name', value)}
              errorMessage={errors?.errors.name}
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
              onChange={(value) =>
                handleChange('assigned_user_id', value.value)
              }
              clearButton={Boolean(project?.assigned_user_id)}
              onClearButtonClick={() => handleChange('assigned_user_id', '')}
              errorMessage={errors?.errors.assigned_user_id}
              queryAdditional
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
      </Container>
    </Default>
  );
}

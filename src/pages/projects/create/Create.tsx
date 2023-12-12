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
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTitle } from '$app/common/hooks/useTitle';
import { Project } from '$app/common/interfaces/project';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankProjectQuery } from '$app/common/queries/projects';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { Container } from '$app/components/Container';
import { Default } from '$app/components/layouts/Default';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { projectAtom } from '../common/atoms';
import { UserSelector } from '$app/components/users/UserSelector';
import { CustomField } from '$app/components/CustomField';
import { $refetch } from '$app/common/hooks/useRefetch';

export default function Create() {
  const { documentTitle } = useTitle('new_project');

  const [t] = useTranslation();

  const pages = [
    { name: t('projects'), href: '/projects' },
    { name: t('new_project'), href: '/projects/create' },
  ];

  const [searchParams] = useSearchParams();
  const [project, setProject] = useAtom(projectAtom);
  const [errors, setErrors] = useState<ValidationBag>();

  const company = useCurrentCompany();
  const clientResolver = useClientResolver();
  const navigate = useNavigate();

  const handleChange = (property: keyof Project, value: unknown) => {
    setProject((project) => project && { ...project, [property]: value });
  };

  const { data } = useBlankProjectQuery({
    enabled: typeof project === 'undefined',
  });

  useEffect(() => {
    setProject((current) => {
      let value = current;

      if (searchParams.get('action') !== 'clone') {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        const _project = cloneDeep(data);

        _project.task_rate = company?.settings.default_task_rate || 0;

        if (searchParams.get('client')) {
          _project.client_id = searchParams.get('client')!;
        }

        value = _project;
      }

      return value;
    });
  }, [data]);

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
    toast.processing();
    setErrors(undefined);

    request('POST', endpoint('/api/v1/projects'), project)
      .then((response) => {
        toast.success('created_project');

        $refetch(['projects']);

        navigate(route('/projects/:id/edit', { id: response.data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      disableSaveButton={!project}
      onSaveClick={onSave}
    >
      <Container>
        <Card title={documentTitle}>
          <Element leftSide={t('project_name')} required>
            <InputField
              value={project?.name}
              onValueChange={(value) => handleChange('name', value)}
              errorMessage={errors?.errors.name}
              cypressRef="name"
            />
          </Element>

          <Element leftSide={t('client')} required>
            <ClientSelector
              value={project?.client_id}
              onChange={(client) => handleChange('client_id', client.id)}
              clearButton={Boolean(project?.client_id)}
              onClearButtonClick={() => handleChange('client_id', '')}
              errorMessage={errors?.errors.client_id}
            />
          </Element>

          <Element leftSide={t('user')}>
            <UserSelector
              value={project?.assigned_user_id}
              onChange={(user) => handleChange('assigned_user_id', user.id)}
              onClearButtonClick={() => handleChange('assigned_user_id', '')}
              errorMessage={errors?.errors.assigned_user_id}
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
              value={project?.budgeted_hours}
              onValueChange={(value) =>
                handleChange('budgeted_hours', parseFloat(value))
              }
              errorMessage={errors?.errors.budgeted_hours}
            />
          </Element>

          <Element leftSide={t('task_rate')}>
            <InputField
              type="number"
              value={project?.task_rate}
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
      </Container>
    </Default>
  );
}

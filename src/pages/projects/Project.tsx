/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { Project as ProjectEntity } from '$app/common/interfaces/project';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useProjectQuery } from '$app/common/queries/projects';
import { Page } from '$app/components/Breadcrumbs';
import { Container } from '$app/components/Container';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Tab, Tabs } from '$app/components/Tabs';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Outlet, useParams } from 'react-router-dom';
import { useActions } from './common/hooks';

export function Project() {
  const { documentTitle, setDocumentTitle } = useTitle('project');
  const { id } = useParams();
  const { data } = useProjectQuery({ id });

  const queryClient = useQueryClient();

  const actions = useActions();

  const [projectValue, setProjectValue] = useState<ProjectEntity>();

  const [errors, setErrors] = useState<ValidationBag>();

  const [t] = useTranslation();

  useEffect(() => {
    data?.name && setDocumentTitle(data.name);
  }, [data]);

  const pages: Page[] = [
    { name: t('projects'), href: '/projects' },
    {
      name: documentTitle,
      href: route('/projects/:id', { id }),
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/projects/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/projects/:id/documents', { id }),
    },
  ];

  const onSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.processing();
    setErrors(undefined);

    request('PUT', endpoint('/api/v1/projects/:id', { id }), projectValue)
      .then(() => {
        toast.success('updated_project');

        queryClient.invalidateQueries(route('/api/v1/projects/:id', { id }));

        queryClient.invalidateQueries('/api/v1/projects');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status == 422) {
          toast.dismiss();
          setErrors(error.response.data);
        } else {
          console.error(error);
          toast.error();
        }
      });
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      disableSaveButton={!projectValue}
      onSaveClick={onSave}
      navigationTopRight={
        projectValue && (
          <ResourceActions
            resource={projectValue}
            label={t('more_actions')}
            actions={actions}
          />
        )
      }
    >
      <Container>
        <Tabs tabs={tabs} />

        <Outlet
          context={{
            errors,
            setErrors,
            project: projectValue,
            setProject: setProjectValue,
          }}
        />
      </Container>
    </Default>
  );
}

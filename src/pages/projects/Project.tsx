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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useTitle } from 'common/hooks/useTitle';
import { Project as ProjectEntity } from 'common/interfaces/project';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useProjectQuery } from 'common/queries/projects';
import { Page } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { ResourceActions } from 'components/ResourceActions';
import { Tab, Tabs } from 'components/Tabs';
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

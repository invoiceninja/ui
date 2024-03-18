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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { useActions } from './common/hooks';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '../settings/invoice-design/pages/custom-designs/components/ChangeTemplate';

export default function Project() {
  const { documentTitle, setDocumentTitle } = useTitle('project');
  const { id } = useParams();
  const { data } = useProjectQuery({ id });

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const actions = useActions();

  const [projectValue, setProjectValue] = useState<ProjectEntity>();

  const [errors, setErrors] = useState<ValidationBag>();

  const [t] = useTranslation();

  useEffect(() => {
    data?.name && setDocumentTitle(data.name);

    if (data) {
      setProjectValue(data);
    }
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
      enabled:
        hasPermission('view_project') ||
        hasPermission('edit_project') ||
        entityAssigned(projectValue),
      formatName: () => (
        <DocumentsTabLabel
          numberOfDocuments={projectValue?.documents?.length}
        />
      ),
    },
  ];

  const onSave = () => {
    toast.processing();
    setErrors(undefined);

    request('PUT', endpoint('/api/v1/projects/:id', { id }), projectValue)
      .then(() => {
        toast.success('updated_project');

        $refetch(['projects']);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status == 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });
  };

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      disableSaveButton={!projectValue}
      navigationTopRight={
        projectValue && (
          <ResourceActions
            resource={projectValue}
            onSaveClick={onSave}
            actions={actions}
            cypressRef="projectActionDropdown"
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

      <ChangeTemplateModal<ProjectEntity>
        entity="project"
        entities={changeTemplateResources as ProjectEntity[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(project) => `${t('number')}: ${project.number}`}
        bulkUrl="/api/v1/projects/bulk"
      />
    </Default>
  );
}

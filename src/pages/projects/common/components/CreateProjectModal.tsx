/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Project } from 'common/interfaces/project';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankProjectQuery } from 'common/queries/projects';
import { ClientSelector } from 'components/clients/ClientSelector';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { Modal } from 'components/Modal';
import { Spinner } from 'components/Spinner';
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onProjectCreated: (project: Project) => unknown;
}

export function CreateProjectModal(props: Props) {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const { data: blankProject } = useBlankProjectQuery();

  const [project, setProject] = useState<Project>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const company = useCurrentCompany();
  const clientResolver = useClientResolver();

  const handleChange = (
    property: keyof Project,
    value: Project[typeof property]
  ) => {
    setErrors(undefined);
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

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/projects'), project)
        .then((response: GenericSingleResourceResponse<Project>) => {
          toast.success('created_project');

          queryClient.invalidateQueries('/api/v1/projects');

          window.dispatchEvent(
            new CustomEvent('invalidate.combobox.queries', {
              detail: {
                url: endpoint('/api/v1/projects'),
              },
            })
          );

          props.onProjectCreated(response.data.data);

          setProject(blankProject);
          props.setVisible(false);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Modal
      title={t('new_project')}
      size="regular"
      visible={props.visible}
      onClose={() => {
        setProject(blankProject);
        props.setVisible(false);
      }}
    >
      {project ? (
        <>
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            <InputField
              label={t('project_name')}
              value={project.name}
              onValueChange={(value) => handleChange('name', value)}
              errorMessage={errors?.errors.name}
            />

            <ClientSelector
              inputLabel={t('client')}
              value={project.client_id}
              onChange={(client) => handleChange('client_id', client.id)}
              clearButton
              onClearButtonClick={() => handleChange('client_id', '')}
              errorMessage={errors?.errors.client_id}
              staleTime={Infinity}
            />

            <DebouncedCombobox
              inputLabel={t('user')}
              defaultValue={project.assigned_user_id}
              endpoint="/api/v1/users"
              label="first_name"
              formatLabel={(resource) =>
                `${resource.first_name} ${resource.last_name}`
              }
              onChange={(value) =>
                handleChange('assigned_user_id', value.value)
              }
              clearButton={Boolean(project.assigned_user_id)}
              onClearButtonClick={() => handleChange('assigned_user_id', '')}
              errorMessage={errors?.errors.assigned_user_id}
              queryAdditional
            />

            <InputField
              label={t('due_date')}
              type="date"
              value={project.due_date}
              onValueChange={(value) => handleChange('due_date', value)}
              errorMessage={errors?.errors.due_date}
            />

            <InputField
              label={t('budgeted_hours')}
              value={project.budgeted_hours}
              onValueChange={(value) => handleChange('budgeted_hours', value)}
              errorMessage={errors?.errors.budgeted_hours}
            />

            <InputField
              label={t('task_rate')}
              value={project.task_rate}
              onValueChange={(value) => handleChange('task_rate', value)}
              errorMessage={errors?.errors.task_rate}
            />

            <InputField
              label={t('public_notes')}
              element="textarea"
              value={project.public_notes}
              onValueChange={(value) => handleChange('public_notes', value)}
              errorMessage={errors?.errors.public_notes}
            />

            <InputField
              label={t('private_notes')}
              element="textarea"
              value={project.private_notes}
              onValueChange={(value) => handleChange('private_notes', value)}
              errorMessage={errors?.errors.private_notes}
            />
          </div>

          <Button
            className="flex self-end"
            disableWithoutIcon
            disabled={!project || isFormBusy}
            onClick={handleSave}
          >
            {t('save')}
          </Button>
        </>
      ) : (
        <Spinner />
      )}
    </Modal>
  );
}

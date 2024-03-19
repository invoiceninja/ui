/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Task as TaskType } from '$app/common/interfaces/task';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTaskQuery } from '$app/common/queries/tasks';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { ResourceActions } from '$app/components/ResourceActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useActions } from './common/hooks';
import { useUpdateTask } from './common/hooks/useUpdateTask';
import { Tab, Tabs } from '$app/components/Tabs';
import { Spinner } from '$app/components/Spinner';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '../settings/invoice-design/pages/custom-designs/components/ChangeTemplate';

export default function Task() {
  const { documentTitle } = useTitle('edit_task');
  const [t] = useTranslation();

  const actions = useActions();

  const { id } = useParams();
  const { data } = useTaskQuery({ id });

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/tasks/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/tasks/:id/documents', { id }),
    },
  ];

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const [task, setTask] = useState<TaskType>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = (property: keyof TaskType, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  const handleSave = useUpdateTask({ isFormBusy, setIsFormBusy, setErrors });

  useEffect(() => {
    if (data) {
      setTask(data);
    }
  }, [data]);

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default
      title={documentTitle}
      disableSaveButton={isFormBusy}
      {...((hasPermission('edit_task') || entityAssigned(task)) &&
        task && {
          navigationTopRight: (
            <ResourceActions
              resource={task}
              onSaveClick={() => handleSave(task)}
              actions={actions}
              cypressRef="taskActionDropdown"
            />
          ),
        })}
    >
      {task ? (
        <div className="space-y-4">
          <Tabs tabs={tabs} />

          <Outlet
            context={{
              errors,
              task,
              handleChange,
            }}
          />
        </div>
      ) : (
        <Spinner />
      )}

      <ChangeTemplateModal<TaskType>
        entity="task"
        entities={changeTemplateResources as TaskType[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(task) => `${t('number')}: ${task.number}`}
        bulkUrl="/api/v1/tasks/bulk"
      />
    </Default>
  );
}

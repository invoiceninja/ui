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
import { InputField, Link } from '$app/components/forms';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Task } from '$app/common/interfaces/task';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { CustomField } from '$app/components/CustomField';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { TabGroup } from '$app/components/TabGroup';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { UserSelector } from '$app/components/users/UserSelector';
import { TaskStatusSelector } from '$app/components/task-statuses/TaskStatusSelector';
import { TaskStatus as TaskStatusBadge } from './TaskStatus';

interface Props {
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => unknown;
  errors: ValidationBag | undefined;
  taskModal?: boolean;
  page?: 'create' | 'edit';
}

export function TaskDetails(props: Props) {
  const [t] = useTranslation();

  const { task, handleChange, errors, page } = props;

  const company = useCurrentCompany();
  const location = useLocation();

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card className="col-span-12 xl:col-span-4 h-max">
        {task && page === 'edit' && (
          <Element leftSide={t('status')}>
            <TaskStatusBadge entity={task} />
          </Element>
        )}

        {!task.project_id && (
          <Element leftSide={t('client')}>
            <ClientSelector
              onChange={(client) => {
                handleChange('client_id', client.id);

                if (!task.id) {
                  handleChange(
                    'rate',
                    client?.settings?.default_task_rate ?? 0
                  );
                }
              }}
              value={task.client_id}
              clearButton={Boolean(task.client_id)}
              onClearButtonClick={() => handleChange('client_id', '')}
              errorMessage={errors?.errors.client_id}
            />
          </Element>
        )}
        <Element leftSide={t('project')}>
          <ProjectSelector
            onChange={(project) => {
              handleChange('project_id', project.id);
              handleChange('client_id', '');
              handleChange('rate', project.task_rate);
            }}
            value={task.project_id}
            clearButton={Boolean(task.project_id)}
            onClearButtonClick={() => handleChange('project_id', '')}
            errorMessage={errors?.errors.project_id}
          />
        </Element>

        <Element leftSide={t('user')}>
          <UserSelector
            value={task?.assigned_user_id}
            onChange={(user) => handleChange('assigned_user_id', user.id)}
            onClearButtonClick={() => handleChange('assigned_user_id', '')}
            errorMessage={errors?.errors.assigned_user_id}
          />
        </Element>

        {task && company?.custom_fields?.task1 && (
          <CustomField
            field="task1"
            defaultValue={task.custom_value1 || ''}
            value={company.custom_fields.task1}
            onValueChange={(value) => handleChange('custom_value1', value)}
          />
        )}

        {task && company?.custom_fields?.task2 && (
          <CustomField
            field="task2"
            defaultValue={task.custom_value2 || ''}
            value={company.custom_fields.task2}
            onValueChange={(value) => handleChange('custom_value2', value)}
          />
        )}
      </Card>

      <Card className="col-span-12 xl:col-span-4 h-max">
        <Element leftSide={t('task_number')}>
          <InputField
            value={task.number}
            onValueChange={(value) => handleChange('number', value)}
            errorMessage={errors?.errors.number}
          />
        </Element>

        <Element leftSide={t('rate')}>
          <InputField
            type="number"
            value={task.rate || 0}
            onValueChange={(value) =>
              handleChange('rate', parseFloat(value) || 0)
            }
            errorMessage={errors?.errors.rate}
          />
        </Element>

        <Element leftSide={t('status')}>
          <TaskStatusSelector
            value={task.status_id}
            onChange={(taskStatus: TaskStatus) =>
              taskStatus && handleChange('status_id', taskStatus.id)
            }
            onClearButtonClick={() => handleChange('status_id', '')}
            readonly={props.taskModal}
            errorMessage={errors?.errors.status_id}
          />
        </Element>

        {task && company?.custom_fields?.task3 && (
          <CustomField
            field="task3"
            defaultValue={task.custom_value3 || ''}
            value={company.custom_fields.task3}
            onValueChange={(value) => handleChange('custom_value3', value)}
          />
        )}

        {task && company?.custom_fields?.task4 && (
          <CustomField
            field="task4"
            defaultValue={task.custom_value4 || ''}
            value={company.custom_fields.task4}
            onValueChange={(value) => handleChange('custom_value4', value)}
          />
        )}
      </Card>

      {location.pathname.endsWith('/edit') && (
        <Card className="col-span-12 xl:col-span-4 h-max px-6">
          <TabGroup tabs={[t('description'), t('custom_fields')]}>
            <div>
              <InputField
                element="textarea"
                value={task.description}
                onValueChange={(value) => handleChange('description', value)}
                errorMessage={errors?.errors.description}
              />
            </div>

            <div>
              <span className="text-sm">{t('custom_fields')} &nbsp;</span>
              <Link to="/settings/custom_fields/tasks" className="capitalize">
                {t('click_here')}
              </Link>
            </div>
          </TabGroup>
        </Card>
      )}

      {!location.pathname.endsWith('/edit') && (
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <InputField
            label={t('description')}
            element="textarea"
            value={task.description}
            onValueChange={(value) => handleChange('description', value)}
            errorMessage={errors?.errors.description}
          />
        </Card>
      )}
    </div>
  );
}

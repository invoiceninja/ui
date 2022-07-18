/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '@headlessui/react';
import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { Task } from 'common/interfaces/task';
import { TaskStatus } from 'common/interfaces/task-status';
import { User } from 'common/interfaces/user';
import { ClientSelector } from 'components/clients/ClientSelector';
import { CustomField } from 'components/CustomField';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { TabGroup } from 'components/TabGroup';
import { Field } from 'pages/settings/custom-fields/components';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface Props {
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => unknown;
}

export function TaskDetails(props: Props) {
  const [t] = useTranslation();

  const { task, handleChange } = props;

  const company = useCurrentCompany();
  const location = useLocation();
  const handleCustomFieldChange = useHandleCustomFieldChange();

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card className="col-span-12 xl:col-span-4 h-max">
        <Element leftSide={t('client')}>
          <ClientSelector
            onChange={(client) => handleChange('client_id', client.id)}
            value={task.client_id}
            clearButton={Boolean(task.client_id)}
            onClearButtonClick={() => handleChange('client_id', '')}
          />
        </Element>

        <Element leftSide={t('project')}>
          <ProjectSelector
            onChange={(project) => handleChange('project_id', project.id)}
            value={task.project_id}
            clearButton={Boolean(task.project_id)}
            onClearButtonClick={() => handleChange('project_id', '')}
          />
        </Element>

        <Element leftSide={t('user')}>
          <DebouncedCombobox
            value={task.assigned_user_id}
            endpoint="/api/v1/users"
            label={'first_name'}
            clearButton={Boolean(task.assigned_user_id)}
            formatLabel={(resource) =>
              `${resource.first_name} ${resource.last_name}`
            }
            onChange={(user: Record<User>) =>
              user.resource &&
              handleChange('assigned_user_id', user.resource.id)
            }
            onClearButtonClick={() => handleChange('assigned_user_id', '')}
            queryAdditional
          />
        </Element>

        {task && company?.custom_fields?.task1 && (
          <CustomField
            field="task1"
            defaultValue={task.custom_value1 || ''}
            value={company.custom_fields.task1}
            onChange={(value) => handleChange('custom_value1', value)}
          />
        )}

        {task && company?.custom_fields?.task2 && (
          <CustomField
            field="task2"
            defaultValue={task.custom_value2 || ''}
            value={company.custom_fields.task2}
            onChange={(value) => handleChange('custom_value2', value)}
          />
        )}
      </Card>

      <Card className="col-span-12 xl:col-span-4 h-max">
        <Element leftSide={t('task_number')}>
          <InputField
            value={task.number}
            onValueChange={(value) => handleChange('number', value)}
          />
        </Element>

        <Element leftSide={t('rate')}>
          <InputField
            value={task.rate}
            onValueChange={(value) => handleChange('rate', value)}
          />
        </Element>

        <Element leftSide={t('status')}>
          <DebouncedCombobox
            endpoint="/api/v1/task_statuses"
            label="name"
            onChange={(value: Record<TaskStatus>) =>
              value.resource && handleChange('status_id', value.resource.id)
            }
            defaultValue={task.status_id}
            queryAdditional
          />
        </Element>

        {task && company?.custom_fields?.task3 && (
          <CustomField
            field="task3"
            defaultValue={task.custom_value3 || ''}
            value={company.custom_fields.task3}
            onChange={(value) => handleChange('custom_value3', value)}
          />
        )}

        {task && company?.custom_fields?.task4 && (
          <CustomField
            field="task4"
            defaultValue={task.custom_value4 || ''}
            value={company.custom_fields.task4}
            onChange={(value) => handleChange('custom_value4', value)}
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
              />
            </div>

            <div>
              {company &&
                ['task1', 'task2', 'task3', 'task4'].map((field) => (
                  <Field
                    key={field}
                    initialValue={company.custom_fields[field]}
                    field={field}
                    placeholder={t('task_field')}
                    onChange={(value: any) =>
                      handleCustomFieldChange(field, value)
                    }
                    noExternalPadding
                  />
                ))}
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
          />
        </Card>
      )}
    </div>
  );
}

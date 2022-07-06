/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { Task } from 'common/interfaces/task';
import { User } from 'common/interfaces/user';
import { useBlankTaskQuery } from 'common/queries/tasks';
import { ClientSelector } from 'components/clients/ClientSelector';
import { CustomField } from 'components/CustomField';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { Default } from 'components/layouts/Default';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Create() {
  const { documentTitle } = useTitle('new_task');
  const { data: blankTask } = useBlankTaskQuery();

  const [t] = useTranslation();
  const [task, setTask] = useState<Task>();

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  const company = useCurrentCompany();

  useEffect(() => {
    blankTask && setTask(blankTask);
  }, [blankTask]);

  return (
    <Default title={documentTitle}>
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <ClientSelector
            onChange={(client) => handleChange('client_id', client.id)}
            value={task?.client_id}
            clearButton={Boolean(task?.client_id)}
            onClearButtonClick={() => handleChange('client_id', '')}
          />

          <ProjectSelector
            onChange={(project) => handleChange('project_id', project.id)}
            value={task?.project_id}
            clearButton={Boolean(task?.project_id)}
            onClearButtonClick={() => handleChange('project_id', '')}
          />

          <DebouncedCombobox
            inputLabel={t('user')}
            endpoint="/api/v1/users"
            label={'first_name'}
            clearButton={Boolean(task?.assigned_user_id)}
            formatLabel={(resource) =>
              `${resource.first_name} ${resource.last_name}`
            }
            onChange={(user: Record<User>) =>
              user.resource &&
              handleChange('assigned_user_id', user.resource.id)
            }
            onClearButtonClick={() => handleChange('assigned_user_id', '')}
          />
        </Card>

        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <InputField
            label={t('task_number')}
            value={task?.number}
            onValueChange={(value) => handleChange('number', value)}
          />

          <InputField
            label={t('rate')}
            value={task?.rate}
            onValueChange={(value) => handleChange('rate', value)}
          />

          <SelectField
            label={t('status')}
            value={task?.status_id}
            onValueChange={(value) => handleChange('status_id', value)}
          >
            <option value="">{t('backlog')}</option>
            <option value="">{t('ready_to_do')}</option>
            <option value="">{t('in_progress')}</option>
            <option value="">{t('done')}</option>
          </SelectField>

          {task && company?.custom_fields?.task1 && (
            <CustomField
              field="task1"
              defaultValue={task?.custom_value1 || ''}
              value={company.custom_fields.task1}
              onChange={(value) => handleChange('custom_value1', value)}
              noExternalPadding
            />
          )}

          {task && company?.custom_fields?.task2 && (
            <CustomField
              field="task2"
              defaultValue={task?.custom_value2 || ''}
              value={company.custom_fields.task2}
              onChange={(value) => handleChange('custom_value2', value)}
              noExternalPadding
            />
          )}
        </Card>
      </div>
    </Default>
  );
}

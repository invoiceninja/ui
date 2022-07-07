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
import { Task } from 'common/interfaces/task';
import { User } from 'common/interfaces/user';
import { ClientSelector } from 'components/clients/ClientSelector';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { useTranslation } from 'react-i18next';

interface Props {
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => unknown;
}

export function ClientProjectUser(props: Props) {
  const [t] = useTranslation();

  const { task, handleChange } = props;

  return (
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
          user.resource && handleChange('assigned_user_id', user.resource.id)
        }
        onClearButtonClick={() => handleChange('assigned_user_id', '')}
      />
    </Card>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { Button, InputField, Link } from '$app/components/forms';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Task } from '$app/common/interfaces/task';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { CustomField } from '$app/components/CustomField';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { useTranslation } from 'react-i18next';
import { UserSelector } from '$app/components/users/UserSelector';
import { TaskStatusSelector } from '$app/components/task-statuses/TaskStatusSelector';
import { TaskStatus as TaskStatusBadge } from './TaskStatus';
import { useStart } from '../hooks/useStart';
import { useStop } from '../hooks/useStop';
import { isTaskRunning } from '../helpers/calculate-entity-state';
import { formatTime, TaskClock } from '../../kanban/components/TaskClock';
import { calculateTime } from '../helpers/calculate-time';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { route } from '$app/common/helpers/route';
import { Icon } from '$app/components/icons/Icon';
import { MdLaunch } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { ClientActionButtons } from '$app/pages/invoices/common/components/ClientActionButtons';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import classNames from 'classnames';
import { MediaPlay } from '$app/components/icons/MediaPlay';
import { MediaPause } from '$app/components/icons/MediaPause';
import { useMediaQuery } from 'react-responsive';

dayjs.extend(duration);

interface Props {
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => unknown;
  errors: ValidationBag | undefined;
  taskModal?: boolean;
  page?: 'create' | 'edit';
}

export function TaskDetails(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { task, handleChange, errors, page } = props;

  const company = useCurrentCompany();
  const isMediumScreen = useMediaQuery({ query: '(min-width: 768px)' });

  const stop = useStop();
  const start = useStart();

  const calculation = calculateTime(task.time_log, {
    inSeconds: true,
    calculateLastTimeLog: false,
  });

  return (
    <Card
      title={
        <div className="flex items-center space-x-4">
          <span>{t('task')}</span>

          {task && page === 'edit' && isMediumScreen && (
            <TaskStatusBadge entity={task} withoutDropdown />
          )}
        </div>
      }
      className="shadow-sm"
      topRight={
        task &&
        page === 'edit' &&
        isMediumScreen && (
          <div className="flex items-center space-x-5">
            {isTaskRunning(task) && <TaskClock task={task} />}

            {!isTaskRunning(task) && calculation && (
              <span className="text-sm font-mono" style={{ color: colors.$17 }}>
                {formatTime(Number(calculation))}
              </span>
            )}

            {!isTaskRunning(task) && !task.invoice_id && (
              <Button
                behavior="button"
                onClick={() => start(task)}
                disableWithoutIcon
                disabled={!hasPermission('edit_task') && !entityAssigned(task)}
              >
                <div className="flex items-center gap-2">
                  <MediaPlay
                    size="1.1rem"
                    color={colors.$1}
                    filledColor={colors.$1}
                  />

                  <span style={{ color: colors.$1 }}>{t('start')}</span>
                </div>
              </Button>
            )}

            {isTaskRunning(task) && !task.invoice_id && (
              <Button
                behavior="button"
                onClick={() => stop(task)}
                disabled={!hasPermission('edit_task') && !entityAssigned(task)}
                disableWithoutIcon
              >
                <div className="flex items-center gap-2">
                  <MediaPause
                    color={colors.$1}
                    filledColor={colors.$1}
                    size="1.1rem"
                  />

                  <span style={{ color: colors.$1 }}>{t('stop')}</span>
                </div>
              </Button>
            )}
          </div>
        )
      }
      style={{ borderColor: colors.$24 }}
      headerClassName={classNames('px-6', {
        'py-2': page === 'edit',
        'py-4': page !== 'edit' || !isMediumScreen,
      })}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
    >
      <div className="flex flex-col space-y-4 items-center justify-start w-full px-6 pb-8 pt-2">
        {task && page === 'edit' && !isMediumScreen && (
          <div className="flex justify-between items-center space-x-2 w-full">
            <TaskStatusBadge entity={task} withoutDropdown />

            <div className="flex items-center space-x-2">
              {isTaskRunning(task) && <TaskClock task={task} />}

              {!isTaskRunning(task) && calculation && (
                <span
                  className="text-sm font-mono"
                  style={{ color: colors.$17 }}
                >
                  {formatTime(Number(calculation))}
                </span>
              )}

              {!isTaskRunning(task) && !task.invoice_id && (
                <Button
                  behavior="button"
                  onClick={() => start(task)}
                  disableWithoutIcon
                  disabled={
                    !hasPermission('edit_task') && !entityAssigned(task)
                  }
                >
                  <div className="flex items-center gap-2">
                    <MediaPlay
                      size="1.1rem"
                      color={colors.$1}
                      filledColor={colors.$1}
                    />

                    <span style={{ color: colors.$1 }}>{t('start')}</span>
                  </div>
                </Button>
              )}

              {isTaskRunning(task) && !task.invoice_id && (
                <Button
                  behavior="button"
                  onClick={() => stop(task)}
                  disabled={
                    !hasPermission('edit_task') && !entityAssigned(task)
                  }
                  disableWithoutIcon
                >
                  <div className="flex items-center gap-2">
                    <MediaPause
                      color={colors.$1}
                      filledColor={colors.$1}
                      size="1.1rem"
                    />

                    <span style={{ color: colors.$1 }}>{t('stop')}</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full lg:w-3/5 place-items-center">
          <div className="flex flex-col space-y-2 w-full">
            <ClientSelector
              inputLabel={t('client')}
              value={task.client_id}
              onChange={(client) => {
                handleChange('client_id', client.id);

                if (!task.id) {
                  handleChange(
                    'rate',
                    client?.settings?.default_task_rate ?? 0
                  );
                }
              }}
              clearButton={Boolean(task.client_id)}
              onClearButtonClick={() => handleChange('client_id', '')}
              readonly={Boolean(task.project_id)}
              errorMessage={errors?.errors.client_id}
            />

            {task.client_id && (
              <ClientActionButtons clientId={task.client_id} />
            )}
          </div>

          <div className="flex self-start items-center justify-center w-full">
            <div
              className="flex flex-1 item-center gap-2"
              style={{ color: colors.$3, colorScheme: colors.$0 }}
            >
              <ProjectSelector
                value={task.project_id}
                inputLabel={t('project')}
                onChange={(project) => {
                  handleChange('project_id', project.id);
                  handleChange('client_id', project.client_id);
                  handleChange('rate', project.task_rate);
                }}
                clientId={task.client_id}
                clearButton={Boolean(task.project_id)}
                onClearButtonClick={() => {
                  handleChange('project_id', '');
                  handleChange('client_id', '');
                }}
                errorMessage={errors?.errors.project_id}
              />
            </div>

            {task?.project_id && (
              <div
                className="flex item-center gap-2 pl-2 mt-6"
                style={{ color: colors.$3, colorScheme: colors.$0 }}
              >
                <Link
                  to={route('/projects/:id', {
                    id: task.project_id,
                  })}
                >
                  <Icon element={MdLaunch} size={18} />
                </Link>
              </div>
            )}
          </div>

          <UserSelector
            inputLabel={t('assigned_user')}
            value={task?.assigned_user_id}
            onChange={(user) => handleChange('assigned_user_id', user.id)}
            onClearButtonClick={() => handleChange('assigned_user_id', '')}
            errorMessage={errors?.errors.assigned_user_id}
            readonly={!hasPermission('edit_task')}
          />

          <InputField
            label={t('task_number')}
            value={task.number}
            onValueChange={(value) => handleChange('number', value)}
            errorMessage={errors?.errors.number}
            width="100%"
          />

          <NumberInputField
            label={t('rate')}
            value={task.rate || ''}
            onValueChange={(value) => handleChange('rate', parseFloat(value))}
            errorMessage={errors?.errors.rate}
            width="100%"
          />

          <TaskStatusSelector
            inputLabel={t('status')}
            value={task.status_id}
            onChange={(taskStatus: TaskStatus) =>
              taskStatus && handleChange('status_id', taskStatus.id)
            }
            onClearButtonClick={() => handleChange('status_id', '')}
            readonly={props.taskModal}
            errorMessage={errors?.errors.status_id}
          />

          {task && company?.custom_fields?.task1 && (
            <CustomField
              labelWrapperClassName="w-full"
              field="task1"
              defaultValue={task.custom_value1 || ''}
              value={company.custom_fields.task1}
              onValueChange={(value) => handleChange('custom_value1', value)}
              labelOnTop
            />
          )}

          {task && company?.custom_fields?.task2 && (
            <CustomField
              labelWrapperClassName="w-full"
              field="task2"
              defaultValue={task.custom_value2 || ''}
              value={company.custom_fields.task2}
              onValueChange={(value) => handleChange('custom_value2', value)}
              labelOnTop
            />
          )}

          {task && company?.custom_fields?.task3 && (
            <CustomField
              labelWrapperClassName="w-full"
              field="task3"
              defaultValue={task.custom_value3 || ''}
              value={company.custom_fields.task3}
              onValueChange={(value) => handleChange('custom_value3', value)}
              labelOnTop
            />
          )}

          {task && company?.custom_fields?.task4 && (
            <CustomField
              labelWrapperClassName="w-full"
              field="task4"
              defaultValue={task.custom_value4 || ''}
              value={company.custom_fields.task4}
              onValueChange={(value) => handleChange('custom_value4', value)}
              labelOnTop
            />
          )}
        </div>

        <div className="w-full lg:w-3/5">
          <InputField
            label={t('description')}
            element="textarea"
            value={task.description}
            onValueChange={(value) => handleChange('description', value)}
            errorMessage={errors?.errors.description}
            width="100%"
          />
        </div>
      </div>
    </Card>
  );
}

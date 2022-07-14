/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Task } from 'common/interfaces/task';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { isTaskRunning } from 'pages/tasks/common/helpers/calculate-entity-state';
import { useBulkAction } from 'pages/tasks/common/hooks/useBulk';
import { useInvoiceTask } from 'pages/tasks/common/hooks/useInvoiceTask';
import { useStart } from 'pages/tasks/common/hooks/useStart';
import { useStop } from 'pages/tasks/common/hooks/useStop';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

interface Props {
  task: Task;
}

export function Actions(props: Props) {
  const { task } = props;
  const [t] = useTranslation();

  const start = useStart();
  const stop = useStop();
  const bulk = useBulkAction();
  const invoiceTask = useInvoiceTask();

  return (
    <Dropdown label={t('more_actions')} className="divide-y">
      <div>
        {!isTaskRunning(task) && (
          <DropdownElement onClick={() => start(task)}>
            {t('start')}
          </DropdownElement>
        )}

        {isTaskRunning(task) && (
          <DropdownElement onClick={() => stop(task)}>
            {t('stop')}
          </DropdownElement>
        )}

        <DropdownElement to={generatePath('/tasks/:id/clone', { id: task.id })}>
          {t('clone')}
        </DropdownElement>

        {!isTaskRunning(task) && !task.invoice_id && (
          <DropdownElement onClick={() => invoiceTask(task)}>
            {t('invoice_task')}
          </DropdownElement>
        )}
      </div>

      <div>
        {task.archived_at === 0 && (
          <DropdownElement onClick={() => bulk(task.id, 'archive')}>
            {t('archive_task')}
          </DropdownElement>
        )}

        {task.archived_at > 0 && (
          <DropdownElement onClick={() => bulk(task.id, 'restore')}>
            {t('restore_task')}
          </DropdownElement>
        )}

        {!task.is_deleted && (
          <DropdownElement onClick={() => bulk(task.id, 'delete')}>
            {t('delete_task')}
          </DropdownElement>
        )}
      </div>
    </Dropdown>
  );
}

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
import { Icon } from 'components/icons/Icon';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdNotStarted,
  MdRestore,
  MdStopCircle,
  MdTextSnippet,
} from 'react-icons/md';
import { useUpdateAtom } from 'jotai/utils';
import { taskAtom } from 'pages/tasks/common/atoms';
import { useNavigate } from 'react-router-dom';

interface Props {
  task: Task;
}

export function Actions(props: Props) {
  const { task } = props;
  const [t] = useTranslation();

  const navigate = useNavigate();

  const start = useStart();
  const stop = useStop();
  const bulk = useBulkAction();
  const invoiceTask = useInvoiceTask();

  const setTask = useUpdateAtom(taskAtom);

  const cloneToTask = () => {
    setTask({ ...task, id: '', documents: [], number: '' });

    navigate('/tasks/create');
  };

  return (
    <Dropdown label={t('more_actions')} className="divide-y">
      <div>
        {!isTaskRunning(task) && (
          <DropdownElement
            onClick={() => start(task)}
            icon={<Icon element={MdNotStarted} />}
          >
            {t('start')}
          </DropdownElement>
        )}

        {isTaskRunning(task) && (
          <DropdownElement
            onClick={() => stop(task)}
            icon={<Icon element={MdStopCircle} />}
          >
            {t('stop')}
          </DropdownElement>
        )}

        <DropdownElement
          onClick={cloneToTask}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone')}
        </DropdownElement>

        {!isTaskRunning(task) && !task.invoice_id && (
          <DropdownElement
            onClick={() => invoiceTask([task])}
            icon={<Icon element={MdTextSnippet} />}
          >
            {t('invoice_task')}
          </DropdownElement>
        )}
      </div>

      <div>
        {task.archived_at === 0 && (
          <DropdownElement
            onClick={() => bulk(task.id, 'archive')}
            icon={<Icon element={MdArchive} />}
          >
            {t('archive')}
          </DropdownElement>
        )}

        {task.archived_at > 0 && (
          <DropdownElement
            onClick={() => bulk(task.id, 'restore')}
            icon={<Icon element={MdRestore} />}
          >
            {t('restore')}
          </DropdownElement>
        )}

        {!task.is_deleted && (
          <DropdownElement
            onClick={() => bulk(task.id, 'delete')}
            icon={<Icon element={MdDelete} />}
          >
            {t('delete')}
          </DropdownElement>
        )}
      </div>
    </Dropdown>
  );
}

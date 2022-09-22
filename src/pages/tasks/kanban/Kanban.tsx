/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { useTaskStatusesQuery } from 'common/queries/task-statuses';
import { useTasksQuery } from 'common/queries/tasks';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsTable } from 'react-icons/bs';
import { calculateTime } from '../common/helpers/calculate-time';
import collect from 'collect.js';
import { toast } from 'common/helpers/toast/toast';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Board from '@asseinfo/react-kanban';
import '@asseinfo/react-kanban/dist/styles.css';

interface Card {
  id: string;
  title: string;
  description: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface Board {
  columns: Column[];
}

export function Kanban() {
  const { documentTitle } = useTitle('kanban');
  const [t] = useTranslation();

  const pages = [
    { name: t('tasks'), href: '/tasks' },
    { name: t('kanban'), href: '/tasks/kanban' },
  ];

  const queryClient = useQueryClient();

  const { data: taskStatuses } = useTaskStatusesQuery();
  const { data: tasks } = useTasksQuery({ limit: 1000 });

  const [board, setBoard] = useState<Board>();

  useEffect(() => {
    if (taskStatuses && tasks) {
      const columns: Column[] = [];

      taskStatuses.data.map((taskStatus) =>
        columns.push({ id: taskStatus.id, title: taskStatus.name, cards: [] })
      );

      tasks.data.map((task) => {
        const index = columns.findIndex(
          (column) => column.id === task.status_id
        );

        if (index >= 0) {
          columns[index].cards.push({
            id: task.id,
            title: task.description,
            description: calculateTime(task.time_log),
          });
        }
      });

      setBoard((current) => ({ ...current, columns }));
    }
  }, [taskStatuses, tasks]);

  const handleDragging = (board: Board) => {
    const taskIds: Record<string, string[]> = {};
    const statusIds = collect(board.columns).pluck('id').toArray() as string[];

    statusIds.forEach((id) => (taskIds[id] = []));

    board.columns.forEach((column) => {
      taskIds[column.id] = collect(column.cards)
        .pluck('id')
        .toArray() as string[];
    });

    const payload = {
      status_ids: statusIds,
      task_ids: taskIds,
    };

    toast.processing();

    request('POST', endpoint('/api/v1/tasks/sort'), payload)
      .then(() => toast.success('updated_task'))
      .catch((error) => {
        console.error(error);

        toast.error();
      })
      .finally(() =>
        queryClient.invalidateQueries(route('/api/v1/tasks'))
      );
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        <Link to="/tasks" className="inline-flex items-center space-x-2">
          <BsTable size={20} />
        </Link>
      }
    >
      {board && (
        <Board
          initialBoard={board}
          onCardDragEnd={handleDragging}
          disableColumnDrag
        />
      )}
    </Default>
  );
}

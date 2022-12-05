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
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { cloneDeep } from 'lodash';
import { arrayMoveImmutable } from 'array-move';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import Board from '@asseinfo/react-kanban';
// import '@asseinfo/react-kanban/dist/styles.css';

interface Card {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            sortOrder: task.status_order,
          });
        }
      });

      columns.map(
        (c) => (c.cards = c.cards.sort((a, b) => a.sortOrder - b.sortOrder))
      );

      setBoard((current) => ({ ...current, columns }));
    }
  }, [taskStatuses, tasks]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateTasks = (board: Board) => {
    const taskIds: Record<string, string[]> = {};
    const statusIds = collect(board.columns).pluck('id').toArray() as string[];

    statusIds.forEach((id) => (taskIds[id] = []));

    board.columns.forEach((column) => {
      column.cards.map((card) => taskIds[column.id].push(card.id));
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
      .finally(() => queryClient.invalidateQueries(route('/api/v1/tasks')));
  };

  const onDragEnd = (result: DropResult) => {
    const local = cloneDeep(board) as Board;

    const source = local.columns.find(
      (c) => c.id === result.source.droppableId
    );

    const sourceIndex = local.columns.findIndex(
      (c) => c.id === result.source.droppableId
    ) as number;

    const target = local.columns.find(
      (c) => c.id === result.destination?.droppableId
    );

    const targetIndex = local.columns.findIndex(
      (c) => c.id === result.destination?.droppableId
    );

    if (source && sourceIndex > -1 && target && targetIndex > -1) {
      const task = source.cards.find((task) => task.id === result.draggableId);

      if (task) {
        local.columns[sourceIndex].cards = source.cards.filter(
          (card) => card.id !== result.draggableId
        );

        local.columns[targetIndex].cards.push(task);

        const taskIndex = local.columns[targetIndex].cards.findIndex(
          (task) => task.id === result.draggableId
        );

        if (result.destination!.index > -1) {
          local.columns[targetIndex].cards = arrayMoveImmutable(
            local.columns[targetIndex].cards,
            taskIndex,
            result.destination?.index || 0
          );
        }
      }
    }

    setBoard(local);

    updateTasks(local);
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
        <div className="flex pb-6 px-1 space-x-4 overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            {board.columns.map((board) => (
              <Droppable key={board.id} droppableId={board.id}>
                {(provided) => (
                  <div
                    className="bg-white rounded shadow select-none h-max"
                    style={{ minWidth: 360 }}
                  >
                    <div className="border-b border-gray-200 px-4 py-5">
                      <h3 className="leading-6 font-medium text-gray-900">
                        {board.title}
                      </h3>
                    </div>

                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-4 space-y-4"
                    >
                      {board.cards.map((card, i) => (
                        <Draggable
                          draggableId={card.id}
                          key={card.id}
                          index={i}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="w-full text-leftblock bg-gray-50 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900 text-sm px-4 sm:px-6 py-4 cursor-move"
                            >
                              {card.title}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </div>
      )}
    </Default>
  );
}

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
import { Slider } from 'components/cards/Slider';
import { Task } from 'common/interfaces/task';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

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

  const [board, setBoard] = useState<Board>();
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task>();

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
      .then(() => toast.success())
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

  const handleCurrentTask = (id: string) => {
    if (currentTask?.id === id) {
      return setIsSliderVisible(true);
    }

    toast.processing();

    queryClient
      .fetchQuery<GenericSingleResourceResponse<Task>>(
        ['/api/v1/tasks', id],
        () => request('GET', endpoint('/api/v1/tasks/:id', { id }))
      )
      .then((response) => {
        setCurrentTask(response.data.data);
        setIsSliderVisible(true);

        toast.dismiss();
      })
      .catch(() => toast.error());
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
      <Slider
        visible={isSliderVisible}
        onClose={() => setIsSliderVisible(false)}
        size="regular"
        title={currentTask?.description}
        withContainer
      >
        My awesome content
      </Slider>

      {board && (
        <div
          className="flex pb-6 px-1 space-x-4 overflow-x-auto"
          style={{ paddingRight: isSliderVisible ? 512 : 0 }}
        >
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
                        <div
                          key={i}
                          className="w-full text-leftblock rounded bg-gray-50 text-gray-700 hover:text-gray-900 text-sm cursor-pointer group"
                        >
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
                                className="px-4 sm:px-6 py-4 bg-gray-50 hover:bg-gray-100"
                              >
                                <p>{card.title}</p>
                                <small>{card.description}</small>
                              </div>
                            )}
                          </Draggable>

                          <div className="hidden group-hover:flex border-t border-gray-100 justify-center items-center">
                            <button
                              className="w-full hover:bg-gray-200 py-2 rounded-bl"
                              onClick={() => handleCurrentTask(card.id)}
                            >
                              {t('view')}
                            </button>

                            <button className="w-full hover:bg-gray-200 py-2">
                              {t('edit')}
                            </button>

                            <button className="w-full hover:bg-gray-200 py-2 rounded-br">
                              {t('resume')}
                            </button>
                          </div>
                        </div>
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

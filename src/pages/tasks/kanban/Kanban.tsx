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
import { Task } from 'common/interfaces/task';
import { useAtom } from 'jotai';
import { ViewSlider } from './components/ViewSlider';
import { isTaskRunning } from '../common/helpers/calculate-entity-state';
import {
  currentTaskAtom,
  currentTaskIdAtom,
  isKanbanViewSliderVisibleAtom,
} from './common/atoms';
import { useHandleCurrentTask } from './common/hooks';
import { useStart } from '../common/hooks/useStart';
import { useStop } from '../common/hooks/useStop';
import { Slider } from 'components/cards/Slider';
import { EditSlider } from './components/EditSlider';
import { Edit, Pause, Play } from 'react-feather';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Card, Element } from '@invoiceninja/cards';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { Inline } from 'components/Inline';
import { MdOutlineAddBox } from 'react-icons/md';
import { useAccentColor } from 'common/hooks/useAccentColor';
import {
  CreateTaskModal,
  TaskDetails,
} from '../common/components/CreateTaskModal';

interface Card {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  task: Task;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface Board {
  columns: Column[];
}

type SliderType = 'view' | 'edit';

export function Kanban() {
  const { documentTitle } = useTitle('kanban');
  const [t] = useTranslation();

  const pages = [
    { name: t('tasks'), href: '/tasks' },
    { name: t('kanban'), href: '/tasks/kanban' },
  ];

  const queryClient = useQueryClient();

  const accentColor = useAccentColor();

  const [apiEndpoint, setApiEndpoint] = useState('/api/v1/tasks');
  const [projectId, setProjectId] = useState<string>();

  const [taskDetails, setTaskDetails] = useState<TaskDetails>();

  const [isTaskModalOpened, setIsTaskModalOpened] = useState<boolean>(false);

  const { data: taskStatuses } = useTaskStatusesQuery();

  const { data: tasks } = useTasksQuery({
    endpoint: apiEndpoint,
    options: { limit: 1000 },
  });

  const [board, setBoard] = useState<Board>();
  const [sliderType, setSliderType] = useState<SliderType>('view');

  const [currentTask] = useAtom(currentTaskAtom);
  const [currentTaskId, setCurrentTaskId] = useAtom(currentTaskIdAtom);

  const [isKanbanViewSliderVisible, setIsKanbanViewSliderVisible] = useAtom(
    isKanbanViewSliderVisibleAtom
  );

  const startTask = useStart();
  const stopTask = useStop();

  useHandleCurrentTask(currentTaskId);

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
            task,
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

  const handleCurrentTask = (id: string, slider: SliderType) => {
    if (slider === 'edit') {
      setSliderType('edit');
    }

    if (slider === 'view') {
      setSliderType('view');
    }

    if (currentTaskId === id) {
      return setIsKanbanViewSliderVisible(true);
    }

    setCurrentTaskId(id);
  };

  const handleKanbanClose = () => {
    setIsKanbanViewSliderVisible(false);
    setCurrentTaskId(undefined);
  };

  useEffect(() => {
    projectId
      ? setApiEndpoint(
          route(
            '/api/v1/tasks?project_tasks=:projectId&limit=1000&per_page=1000',
            {
              projectId,
            }
          )
        )
      : setApiEndpoint('/api/v1/tasks?limit=1000&per_page=1000');
  }, [projectId]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        <Link to="/tasks">
          <Inline>
            <BsTable size={20} />
            <span>{t('tasks')}</span>
          </Inline>
        </Link>
      }
    >
      <Slider
        title={
          currentTask
            ? `${t('task')} ${currentTask.number}`
            : (t('task') as string)
        }
        visible={isKanbanViewSliderVisible}
        onClose={handleKanbanClose}
        actionChildren={
          <div className="flex w-full divide-x-2">
            {sliderType === 'view' && (
              <ReactRouterLink
                to={route('/tasks/:id/edit', { id: currentTask?.id })}
                className="flex justify-center items-center text-sm p-4 space-x-2 w-full hover:bg-gray-50"
              >
                <Edit size={18} />
                <span>{t('edit_task')}</span>
              </ReactRouterLink>
            )}

            {/* <button className="flex justify-center items-center text-sm p-4 space-x-2 w-full hover:bg-gray-50">
              <Plus size={18} />
              <span>{t('invoice_task')}</span>
            </button> */}

            {currentTask && !isTaskRunning(currentTask) && (
              <button
                className="flex justify-center items-center text-sm p-4 space-x-2 w-full hover:bg-gray-50"
                onClick={() => startTask(currentTask)}
              >
                <Play size={18} />
                <span>{t('start')}</span>
              </button>
            )}

            {currentTask && isTaskRunning(currentTask) && (
              <button
                className="flex justify-center items-center text-sm p-4 space-x-2 w-full hover:bg-gray-50"
                onClick={() => stopTask(currentTask)}
              >
                <Pause size={18} />
                <span>{t('stop')}</span>
              </button>
            )}
          </div>
        }
        size="regular"
        withoutActionContainer
      >
        {sliderType === 'view' && <ViewSlider />}
        {sliderType === 'edit' && <EditSlider />}
      </Slider>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4">
          <Element leftSide={t('project')}>
            <ProjectSelector
              value={projectId}
              onChange={(project) => setProjectId(project.id)}
              onClearButtonClick={() => setProjectId(undefined)}
              clearButton
            />
          </Element>
        </Card>
      </div>

      {board && (
        <div
          className="flex pb-6 space-x-4 overflow-x-auto mt-4"
          style={{ paddingRight: isKanbanViewSliderVisible ? 512 : 0 }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            {board.columns.map((board) => (
              <Droppable key={board.id} droppableId={board.id}>
                {(provided) => (
                  <div
                    className="bg-white rounded shadow select-none h-max"
                    style={{ minWidth: 360 }}
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5">
                      <h3 className="leading-6 font-medium text-gray-900">
                        {board.title}
                      </h3>

                      <MdOutlineAddBox
                        className="cursor-pointer"
                        fontSize={28}
                        color={accentColor}
                        onClick={() => {
                          setTaskDetails({ taskStatusId: board.id, projectId });
                          setIsTaskModalOpened(true);
                        }}
                      />
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
                              onClick={() => handleCurrentTask(card.id, 'view')}
                            >
                              {t('view')}
                            </button>

                            <button
                              className="w-full text-center hover:bg-gray-200 py-2"
                              onClick={() => handleCurrentTask(card.id, 'edit')}
                            >
                              {t('edit')}
                            </button>

                            {isTaskRunning(card.task) && (
                              <button
                                className="w-full hover:bg-gray-200 py-2 rounded-br"
                                onClick={() => stopTask(card.task)}
                              >
                                {t('stop')}
                              </button>
                            )}

                            {!isTaskRunning(card.task) && (
                              <button
                                className="w-full hover:bg-gray-200 py-2 rounded-br"
                                onClick={() => startTask(card.task)}
                              >
                                {t('start')}
                              </button>
                            )}
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

      <CreateTaskModal
        visible={isTaskModalOpened}
        setVisible={setIsTaskModalOpened}
        details={taskDetails}
        apiEndPoint={apiEndpoint}
      />
    </Default>
  );
}

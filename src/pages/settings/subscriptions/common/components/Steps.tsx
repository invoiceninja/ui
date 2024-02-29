import { useTranslation } from 'react-i18next';
import { SubscriptionProps } from './Overview';
import { Card, Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useEffect, useState } from 'react';
import { Icon } from '$app/components/icons/Icon';
import { MdClose, MdDragHandle } from 'react-icons/md';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from '@hello-pangea/dnd';
import { useQuery } from 'react-query';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { AxiosResponse } from 'axios';
import { checkDependencies } from '../utilities/dependencies';

export type Steps = Record<
  string,
  { id: string; label: string; dependencies: string[] }
>;

export function Steps({
  subscription,
  handleChange,
  errors,
}: SubscriptionProps) {
  const { t } = useTranslation();

  const steps = subscription.steps ? subscription.steps.split(',') : [];

  const [dependencyErrors, setDependencyErrors] = useState<string[]>([]);

  const { data: dependencies } = useQuery({
    initialData: {},
    queryKey: ['subscriptions', 'dependencies'],
    queryFn: () =>
      request('GET', endpoint('/api/v1/subscriptions/steps')).then(
        (response: AxiosResponse<Steps>) => response.data
      ),
  });

  const filtered = dependencies
    ? Object.values(dependencies).filter((step) => !steps.includes(step.id))
    : [];

  function handleDelete(column: string) {
    handleChange('steps', steps.filter((step) => step !== column).join(','));
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination || !dependencies) {
      return;
    }

    const items = Array.from(steps);

    const [reorderedItem] = items.splice(result.source.index, 1);

    items.splice(result.destination.index, 0, reorderedItem);

    setDependencyErrors(checkDependencies(dependencies, items));
    handleChange('steps', items.join(','));
  }

  useEffect(() => {
    if (dependencies) {
      setDependencyErrors(checkDependencies(dependencies, steps));
    }
  }, [steps.length]);

  return (
    <Card title={t('steps')}>
      <Element leftSide={t('add_step')}>
        <SelectField
          value=""
          onValueChange={(value) => {
            handleChange('steps', [...steps, value].join(','));
          }}
          withBlank
        >
          {filtered.map((column, index) => (
            <option key={index} value={column.id}>
              {t(column.id)}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('order')} leftSideHelp={t('order_help')}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {steps.map((step, index) => (
                  <Draggable
                    key={index}
                    draggableId={`item-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex space-x-2 items-center">
                          <Icon
                            className="cursor-pointer"
                            element={MdClose}
                            size={20}
                            onClick={() => handleDelete(step)}
                          />

                          <p>{t(step)}</p>
                        </div>

                        <div {...provided.dragHandleProps}>
                          <Icon element={MdDragHandle} size={23} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {dependencyErrors.length > 0 && (
          <div className="text-red-500 mt-2">
            {dependencyErrors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}

            <p className="mt-3">
              You won't be able to save until order is correct.
            </p>
          </div>
        )}
      </Element>
    </Card>
  );
}

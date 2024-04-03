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
import { AxiosError, AxiosResponse } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

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

    handleChange('steps', items.join(','));
    checkDependencies(items.join(','));
  }

  function checkDependencies(v?: string) {
    request('POST', endpoint('/api/v1/subscriptions/steps/check'), {
      steps: v ?? steps.join(','),
    })
      .then(() => setDependencyErrors([]))
      .catch((e: AxiosError<ValidationBag>) => {
        if (e.response?.data.errors.steps) {
          setDependencyErrors(e.response.data.errors.steps);
        }
      });
  }

  useEffect(() => {
    if (dependencies) {
      checkDependencies();
    }
  }, [steps.length]);

  const auth = filtered
    .filter((step) => step.id.startsWith('auth.'))
    .filter((step) => {
      if (steps.some((s) => s.startsWith('auth.'))) {
        return !step.id.startsWith('auth.');
      }

      return true;
    });

  return (
    <Card title={t('steps')}>
      <Element leftSide={t('authentication')}>
        <SelectField
          value=""
          onValueChange={(value) => {
            handleChange('steps', [...steps, value].join(','));
          }}
          withBlank
        >
          {auth.map((column, index) => (
            <option key={index} value={column.id}>
              {t(column.id)}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('other_steps')}>
        <SelectField
          value=""
          onValueChange={(value) => {
            handleChange('steps', [...steps, value].join(','));
          }}
          withBlank
        >
          {filtered
            .filter((step) => !step.id.startsWith('auth.'))
            .map((column, index) => (
              <option key={index} value={column.id}>
                {t(column.id)}
              </option>
            ))}
        </SelectField>
      </Element>

      <Element leftSide={t('order')} leftSideHelp={t('steps_order_help')}>
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

        {errors?.errors.steps ? (
          <div className="text-red-500 mt-2">{errors.errors.steps}</div>
        ) : dependencyErrors.length ? (
          <div className="text-red-500 mt-2">
            {dependencyErrors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        ) : null}
      </Element>
    </Card>
  );
}

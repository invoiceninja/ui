import { useTranslation } from 'react-i18next';
import { SubscriptionProps } from './Overview';
import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useEffect, useState } from 'react';
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
import { GridDotsVertical } from '$app/components/icons/GridDotsVertical';
import { useColorScheme } from '$app/common/colors';
import { CircleXMark } from '$app/components/icons/CircleXMark';

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

  const colors = useColorScheme();

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
    <>
      <Element leftSide={t('authentication')}>
        <SelectField
          value=""
          onValueChange={(value) => {
            handleChange('steps', [...steps, value].join(','));
          }}
          withBlank
          customSelector
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
          customSelector
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
                          <div {...provided.dragHandleProps}>
                            <GridDotsVertical
                              size="1.2rem"
                              color={colors.$17}
                            />
                          </div>

                          <p>{t(step)}</p>
                        </div>

                        <div
                          className="cursor-pointer"
                          onClick={() => handleDelete(step)}
                        >
                          <CircleXMark
                            color={colors.$16}
                            hoverColor={colors.$3}
                            borderColor={colors.$5}
                            hoverBorderColor={colors.$17}
                            size="1.6rem"
                          />
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
    </>
  );
}

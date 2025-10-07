/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { arrayMoveImmutable } from 'array-move';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { injectInChanges } from '$app/common/stores/slices/company-users';
import { cloneDeep, set } from 'lodash';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { GridDotsVertical } from '$app/components/icons/GridDotsVertical';
import { useColorScheme } from '$app/common/colors';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import classNames from 'classnames';

interface Props {
  defaultVariables: { value: string; label: string }[];
  for: string;
  disabled?: boolean;
}

export function SortableVariableList(props: Props) {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const dispatch = useDispatch();

  const { disabled } = props;

  const colors = useColorScheme();

  const defaultVariables = props.defaultVariables;

  const [defaultVariablesFiltered, setDefaultVariablesFiltered] =
    useState(defaultVariables);

  useEffect(() => {
    const variables = company?.settings?.pdf_variables?.[props.for] ?? [];

    setDefaultVariablesFiltered(
      defaultVariables.filter((label) => !variables.includes(label.value))
    );
  }, [company]);

  const resolveTranslation = (key: string) => {
    return defaultVariables.find((field) => field.value === key);
  };

  const handleSelectChange = (value: string): void => {
    if (value === '') {
      return;
    }

    const companyClone = cloneDeep(company);

    if (!companyClone.settings.pdf_variables) {
      set(companyClone, 'settings.pdf_variables', {});

      if (!companyClone.settings?.pdf_variables?.[props.for]) {
        set(companyClone, `settings.pdf_variables.${props.for}`, []);
      }
    }

    companyClone.settings.pdf_variables?.[props.for]?.push(value);

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  };

  const remove = (property: string) => {
    const companyClone = cloneDeep(company);

    const filtered = companyClone.settings.pdf_variables?.[props.for].filter(
      (variable: string) => variable !== property
    );

    set(companyClone, `settings.pdf_variables.${props.for}`, filtered);

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  };

  const onDragEnd = (result: DropResult) => {
    const companyClone = cloneDeep(company);

    const filtered = arrayMoveImmutable(
      companyClone.settings.pdf_variables?.[props.for],
      result.source.index,
      result.destination?.index as unknown as number
    );

    set(companyClone, `settings.pdf_variables.${props.for}`, filtered);

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  };

  return (
    <>
      <Element leftSide={t('fields')}>
        <SelectField
          value=""
          onValueChange={(value) => value && handleSelectChange(value)}
          disabled={disabled}
          customSelector
          clearAfterSelection
        >
          <option value=""></option>

          {defaultVariablesFiltered.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('variables')} textVerticalAlign="top">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={props.for} isDropDisabled={disabled}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {company?.settings?.pdf_variables?.[props.for]?.map(
                  (label: string, index: number) => (
                    <Draggable
                      key={label}
                      draggableId={label}
                      index={index}
                      isDragDisabled={disabled}
                    >
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className="flex items-center justify-between"
                          key={label}
                        >
                          <div className="flex items-center space-x-2 py-2">
                            <div>
                              <GridDotsVertical
                                size="1.2rem"
                                color={colors.$17}
                              />
                            </div>

                            <span>{resolveTranslation(label)?.label}</span>
                          </div>

                          <div
                            className={classNames({
                              'cursor-not-allowed opacity-75': disabled,
                              'cursor-pointer': !disabled,
                            })}
                            onClick={() => !disabled && remove(label)}
                          >
                            <CircleXMark
                              color={colors.$16}
                              hoverColor={colors.$3}
                              borderColor={colors.$5}
                              hoverBorderColor={colors.$17}
                              size="1.5rem"
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  )
                )}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Element>
    </>
  );
}

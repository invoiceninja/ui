/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button, SelectField } from '@invoiceninja/forms';
import { arrayMoveImmutable } from 'array-move';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { injectInChanges } from 'common/stores/slices/company-users';
import { cloneDeep, set } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

interface Props {
  defaultVariables: { value: string; label: string }[];
  for: string;
}

export function SortableVariableList(props: Props) {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const dispatch = useDispatch();

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

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const selectedOption = event.target.options[event.target.selectedIndex];

    if (selectedOption.value === '') {
      return;
    }

    const companyClone = cloneDeep(company);

    companyClone.settings.pdf_variables?.[props.for].push(selectedOption.value);

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
    <Card title={t(props.for)}>
      <Element leftSide={t('fields')}>
        <SelectField onChange={handleSelectChange}>
          <option></option>

          {defaultVariablesFiltered.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('variables')}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={props.for}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {company?.settings?.pdf_variables?.[props.for]?.map(
                  (label: string, index: number) => (
                    <Draggable key={label} draggableId={label} index={index}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className="flex items-center space-x-2 py-2 "
                          key={label}
                        >
                          <Button
                            type="minimal"
                            onClick={() => remove(label)}
                            behavior="button"
                          >
                            <X />
                          </Button>

                          <span>{resolveTranslation(label)?.label}</span>
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
    </Card>
  );
}

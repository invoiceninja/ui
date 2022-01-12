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

export function ClientDetails() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const dispatch = useDispatch();

  const defaultVariables = [
    { value: '$client.name', label: t('client_name') },
    { value: '$client.number', label: t('client_number') },
    { value: '$client.id_number', label: t('id_number') },
    { value: '$client.vat_number', label: t('vat_number') },
    { value: '$client.website', label: t('website') },
    { value: '$client.phone', label: t('phone') },
    { value: '$client.address1', label: t('address1') },
    { value: '$client.address2', label: t('address2') },
    { value: '$client.city_state_postal', label: t('city_state_postal') },
    { value: '$client.postal_city_state', label: t('postal_city_state') },
    { value: '$client.country', label: t('country') },
    { value: '$client.custom1', label: t('custom1') },
    { value: '$client.custom2', label: t('custom2') },
    { value: '$client.custom3', label: t('custom3') },
    { value: '$client.custom4', label: t('custom4') },

    { value: '$contact.full_name', label: t('contact_full_name') },
    { value: '$contact.email', label: t('contact_email') },
    { value: '$contact.phone', label: t('contact_phone') },
    { value: '$contact.custom1', label: t('contact_custom_value1') },
    { value: '$contact.custom2', label: t('contact_custom_value2') },
    { value: '$contact.custom3', label: t('contact_custom_value3') },
    { value: '$contact.custom4', label: t('contact_custom_value4') },
  ];

  const [defaultVariablesFiltered, setDefaultVariablesFiltered] =
    useState(defaultVariables);

  useEffect(() => {
    const variables = company?.settings?.pdf_variables?.client_details ?? [];

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

    companyClone.settings.pdf_variables.client_details.push(
      selectedOption.value
    );

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  };

  const remove = (property: string) => {
    const companyClone = cloneDeep(company);

    const filtered = companyClone.settings.pdf_variables.client_details.filter(
      (variable: string) => variable !== property
    );

    set(companyClone, 'settings.pdf_variables.client_details', filtered);

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  };

  const onDragEnd = (result: DropResult) => {
    const companyClone = cloneDeep(company);

    const filtered = arrayMoveImmutable(
      companyClone.settings.pdf_variables.client_details,
      result.source.index,
      result.destination?.index as unknown as number
    );

    set(companyClone, 'settings.pdf_variables.client_details', filtered);

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  };

  return (
    <Card title={t('client_details')}>
      <Element leftSide={t('fields')}>
        <SelectField onChange={handleSelectChange}>
          <option></option>

          {defaultVariablesFiltered.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('variables')}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="client_details">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {company?.settings?.pdf_variables?.client_details?.map(
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

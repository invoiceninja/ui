/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import {
  Calculate,
  DashboardField,
  Field,
  Period,
} from '$app/common/interfaces/company-user';
import { Button, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { arrayMoveImmutable } from 'array-move';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CgOptions } from 'react-icons/cg';
import { MdClose, MdDragHandle } from 'react-icons/md';

const FIELDS = [
  'active_invoices',
  'outstanding_invoices',
  'completed_payments',
  'refunded_payments',
  'active_quotes',
  'unapproved_quotes',
  'logged_tasks',
  'invoiced_tasks',
  'paid_tasks',
  'logged_expenses',
  'pending_expenses',
  'invoiced_expenses',
  'invoice_paid_expenses',
];

export function DashboardCardSelector() {
  const [t] = useTranslation();

  const currentUser = useCurrentUser();

  const userChanges = useInjectUserChanges();

  const [currentFields, setCurrentFields] = useState<DashboardField[]>([]);

  const [currentField, setCurrentField] = useState<DashboardField>({
    field: '' as Field,
    period: 'current',
    calculate: 'sum',
    format: 'time',
  });

  const [isCardsModalOpen, setIsCardsModalOpen] = useState<boolean>(false);
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState<boolean>(false);

  const handleCardsModalClose = () => {
    setIsCardsModalOpen(false);
  };

  const handleFieldsModalClose = () => {
    setIsFieldsModalOpen(false);

    setCurrentField({
      field: '' as Field,
      period: 'current',
      calculate: 'sum',
      format: 'time',
    });
  };

  const onDragEnd = (result: DropResult) => {
    const sorted = arrayMoveImmutable(
      currentFields,
      result.source.index,
      result.destination?.index as unknown as number
    );

    setCurrentFields(sorted);
  };

  const handleDelete = (fieldKey: Field) => {
    const updatedCurrentColumns = currentFields.filter(
      (field) => field.field !== fieldKey
    );

    setCurrentFields(updatedCurrentColumns);
  };

  return (
    <>
      <div
        className="flex h-full items-center cursor-pointer"
        onClick={() => setIsCardsModalOpen(true)}
      >
        <Icon element={CgOptions} size={28} />
      </div>

      <Modal
        title={t('settings')}
        visible={isCardsModalOpen}
        onClose={handleCardsModalClose}
        disableClosing={isFieldsModalOpen}
      >
        <div className="flex flex-col space-y-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="columns"
              renderClone={(provided, _, rubric) => {
                const dashboardField = currentFields[rubric.source.index];

                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div className="flex space-x-2 items-center">
                      <Icon element={MdClose} size={20} />

                      <div className="flex flex-col">
                        <p>{t(dashboardField.field)}</p>

                        <div>
                          <span>{t(dashboardField.period)}</span>
                          <span>&middot;</span>
                          <span>{t(dashboardField.calculate)}</span>
                        </div>
                      </div>
                    </div>

                    <div {...provided.dragHandleProps}>
                      <Icon element={MdDragHandle} size={23} />
                    </div>
                  </div>
                );
              }}
            >
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {currentFields.map((field, index) => (
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
                              onClick={() => handleDelete(field.field)}
                            />

                            <div className="flex flex-col">
                              <p>{t(field.field)}</p>

                              <div>
                                <span>{t(field.period)}</span>
                                <span>&middot;</span>
                                <span>{t(field.calculate)}</span>
                              </div>
                            </div>
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

          <Button
            behavior="button"
            type="secondary"
            onClick={() => setIsFieldsModalOpen(true)}
          >
            {t('add_field')}
          </Button>

          <SelectField>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
          </SelectField>

          <Button behavior="button">{t('save')}</Button>
        </div>
      </Modal>

      <Modal
        title={t('add_field')}
        size="extraSmall"
        visible={isFieldsModalOpen}
        onClose={handleFieldsModalClose}
      >
        <div className="flex flex-col space-y-4">
          <SelectField
            label={t('field')}
            value={currentField.field}
            onValueChange={(value) =>
              setCurrentField((currentField) => ({
                ...currentField,
                field: value as Field,
              }))
            }
            withBlank
          >
            {FIELDS.map((field) => (
              <option key={field} value={field}>
                {t(field)}
              </option>
            ))}
          </SelectField>

          <SelectField
            label={t('period')}
            value={currentField.period}
            onValueChange={(value) =>
              setCurrentField((currentField) => ({
                ...currentField,
                period: value as Period,
              }))
            }
          >
            <option value="current">{t('current_period')}</option>
            <option value="previous">{t('previous_period')}</option>
            <option value="total">{t('total')}</option>
          </SelectField>

          <SelectField
            label={t('calculate')}
            value={currentField.calculate}
            onValueChange={(value) =>
              setCurrentField((currentField) => ({
                ...currentField,
                calculate: value as Calculate,
              }))
            }
          >
            <option value="sum">{t('sum')}</option>
            <option value="avg">{t('average')}</option>
            <option value="count">{t('count')}</option>
          </SelectField>

          <Button
            behavior="button"
            onClick={() => {
              setCurrentFields((current) => [...current, currentField]);
              handleFieldsModalClose();
            }}
            disabled={!currentField.field}
            disableWithoutIcon
          >
            {t('add')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
